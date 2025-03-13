use actix_web::{
  get, post,
  web::{Data, Json, Query},
  HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  oauth_provider::AuthenticateWithOAuth,
  user::{LoginResponse, Register, RegisterResponse, VerifyEmailRegistration},
  utils::{build_cookie, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME},
};
use chrono::{Duration, Utc};
use database::{
  connection::Database,
  source::{
    login_token::{LoginToken, LoginTokenInsertForm},
    oauth_account::{OAuthAccount, OAuthAccountInsertForm},
    pending_user::{PendingUser, PendingUserInsertForm},
    permission::Permission,
    user::{User, UserInsertForm},
    user_permissin::UserPermission,
  },
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  setting::SETTINGS,
  utils::{
    email::send_email,
    hash::hash_passwrod,
    random::generate_random_string,
    token::{
      sign_access_token, sign_refresh_token, sign_verification_token, verify_verification_token,
    },
  },
};
use uuid::Uuid;

#[get("/oauth/callback")]
pub async fn authenticate_with_oauth(
  context: Data<KalamcheContext>,
  Query(query): Query<AuthenticateWithOAuth>,
) -> KalamcheResult<HttpResponse> {
  let oauth_user = context
    .oauth()
    .authenticate(&query.provider, query.code)
    .await?;

  let user = match OAuthAccount::find_by_oauth_id(context.pool(), &oauth_user.id).await? {
    Some(account) => User::find_by_id(context.pool(), account.user_id)
      .await?
      .ok_or(KalamcheErrorType::InvalidOAuthAuthorization)?,
    None => {
      let user = insert_new_user(
        context.pool(),
        UserInsertForm {
          name: oauth_user.name,
          email: oauth_user.email,
          avatar_url: oauth_user.avatar_url,
          password_hash: None,
        },
      )
      .await?;

      OAuthAccount::insert(
        context.pool(),
        OAuthAccountInsertForm {
          user_id: user.id,
          oauth_user_id: oauth_user.id,
        },
      )
      .await?;

      user
    }
  };

  let user_permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;
  let (access_token, refresh_token) = create_token(user.id, user_permissions.clone()).await?;

  LoginToken::insert(
    context.pool(),
    LoginTokenInsertForm {
      user_id: user.id,
      token_hash: refresh_token.to_owned(), //TODO: hash refresh token
    },
  )
  .await?;

  let user_record = User::into_record(user, user_permissions);
  context
    .cache
    .set(
      format!("user:{}", user_record.id).as_ref(),
      &user_record,
      Some(60 * 60 * 24),
    )
    .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    user: user_record,
  }))
}

#[post("/signup")]
pub async fn register(
  context: Data<KalamcheContext>,
  payload: Json<Register>,
) -> KalamcheResult<Json<RegisterResponse>> {
  // TODO: validate user email by regex
  // returns error if exists
  User::email_exists(context.pool(), &payload.email).await?;

  if PendingUser::find_by_email(context.pool(), &payload.email).await? {
    return Err(KalamcheError::from(
      KalamcheErrorType::AccountVerificationIsPending,
    ));
  }

  let pending_user_id = Uuid::new_v4();
  let verification_code = generate_random_string();
  let verification_token = sign_verification_token(
    SETTINGS.get_jwt(),
    pending_user_id,
    verification_code.clone(),
  )?;

  let _ = PendingUser::insert(
    context.pool(),
    PendingUserInsertForm {
      id: pending_user_id,
      email: payload.email.clone(),
      token: verification_token.clone(),
      password_hash: hash_passwrod(&payload.password)?,
    },
  )
  .await?;

  send_email(
    "Verification email",
    &payload.email,
    &format!(
      "<h1>{}</h1>\n<h1>url: {}</h1>",
      verification_code,
      SETTINGS.get_jwt().verification_redirect_url
    ),
    SETTINGS.get_email(),
  )?;

  Ok(Json(RegisterResponse {
    success: true,
    verification_token,
  }))
}

#[post("/email/verify")]
pub async fn verify_email_registration(
  context: Data<KalamcheContext>,
  Json(payload): Json<VerifyEmailRegistration>,
) -> KalamcheResult<HttpResponse> {
  let claims = verify_verification_token(SETTINGS.get_jwt(), &payload.token)?;

  if payload.code != claims.code {
    return Err(KalamcheError::from(
      KalamcheErrorType::InvalidVerificationCode,
    ));
  }

  let pending_user = PendingUser::find_by_id(context.pool(), claims.sub)
    .await?
    .ok_or(KalamcheErrorType::AccountNotRegistered)?;

  let verification_token_duration =
    Utc::now() + Duration::minutes(SETTINGS.get_jwt().verfication_expiry as i64);
  if pending_user.published >= verification_token_duration {
    return Err(KalamcheError::from(
      KalamcheErrorType::ExpiredVerificationCode,
    ));
  }

  let user = match User::find_user_by_email(context.pool(), &pending_user.email).await? {
    Some(user) => user,
    None => {
      insert_new_user(
        context.pool(),
        UserInsertForm {
          name: pending_user
            .email
            .split("@")
            .next()
            .unwrap_or("unknown")
            .to_string(),
          email: pending_user.email,
          password_hash: Some(pending_user.password_hash),
          avatar_url: "https://avatar.iran.liara.run/public".to_string(),
        },
      )
      .await?
    }
  };

  PendingUser::delete_by_id(context.pool(), pending_user.id).await?;

  let user_permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;
  let (access_token, refresh_token) = create_token(user.id, user_permissions.clone()).await?;

  LoginToken::insert(
    context.pool(),
    LoginTokenInsertForm {
      user_id: user.id,
      token_hash: refresh_token.to_owned(), //TODO: hash refresh token
    },
  )
  .await?;

  let user_record = User::into_record(user, user_permissions);
  context
    .cache
    .set(
      format!("user:{}", user_record.id).as_ref(),
      &user_record,
      Some(60 * 60 * 24),
    )
    .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    user: user_record,
  }))
}

async fn insert_new_user(pool: &Database, insert_form: UserInsertForm) -> KalamcheResult<User> {
  let user = User::insert(pool, insert_form).await?;

  let default_permissions = Permission::find_default_permission(pool).await?;
  UserPermission::insert_with_default_permission(pool, user.id, default_permissions).await?;

  Ok(user)
}

async fn create_token(user_id: Uuid, permissions: Vec<String>) -> KalamcheResult<(String, String)> {
  let (access_token, refresh_token) =
    tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
      let access_token = sign_access_token(SETTINGS.get_jwt(), user_id, permissions)?;
      let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
      Ok((access_token, refresh_token))
    })
    .await??;

  Ok((access_token, refresh_token))
}
