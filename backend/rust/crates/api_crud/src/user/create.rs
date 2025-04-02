use actix_web::{
  get, post,
  web::{Data, Json, Query},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  oauth_provider::AuthenticateWithOAuth,
  user::{LoginResponse, VerifyEmailRegistration},
  utils::{
    build_cookie, create_token, get_user_ip, update_login_token_user_cache, RT_COOKIE_MAX_AGE,
    RT_COOKIE_NAME,
  },
};
use chrono::{Duration, Utc};
use database::{
  connection::Database,
  source::{
    login_token::LoginTokenInsertForm,
    oauth_account::{OAuthAccount, OAuthAccountInsertForm},
    pending_user::PendingUser,
    permission::Permission,
    user::{User, UserInsertForm},
    user_permissin::UserPermission,
  },
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{hash::hash_passwrod, token::verify_verification_token},
};

#[get("/oauth/callback")]
pub async fn authenticate_with_oauth(
  context: Data<KalamcheContext>,
  req: HttpRequest,
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
      User::email_exists(context.pool(), &oauth_user.email).await?;

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

  let user_record = update_login_token_user_cache(
    &context,
    LoginTokenInsertForm {
      user_id: user.id,
      ip: get_user_ip(&req),
      token_hash: hash_passwrod(&refresh_token)?,
    },
    user,
    user_permissions,
  )
  .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    user: user_record,
  }))
}

#[post("/email/verify")]
pub async fn verify_email_registration(
  context: Data<KalamcheContext>,
  req: HttpRequest,
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

  // age of the verification token by subtracting the token's created_at time from the current time
  let token_age = Utc::now().fixed_offset() - pending_user.created_at;

  // Check if the verification token has expired
  if token_age > Duration::minutes(SETTINGS.get_jwt().verfication_expiry as i64) {
    return Err(KalamcheError::from(
      KalamcheErrorType::ExpiredVerificationCode,
    ));
  }

  let user = match User::find_user_by_email(context.pool(), &pending_user.email).await? {
    Some(user) => user,
    None => {
      // there is a low chanse to throw error
      let user_name = pending_user
        .email
        .split("@")
        .next()
        .ok_or(KalamcheError::from(KalamcheErrorType::InvalidEmailAddress))?
        .to_string();

      let password_hash = pending_user
        .password_hash
        .ok_or(KalamcheErrorType::InvalidCredentials)?;

      insert_new_user(
        context.pool(),
        UserInsertForm {
          name: user_name,
          email: pending_user.email,
          password_hash: Some(password_hash),
          avatar_url: "#".to_string(), // default avatar_url is #
        },
      )
      .await?
    }
  };

  PendingUser::delete_by_id(context.pool(), pending_user.id).await?;

  let user_permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;
  let (access_token, refresh_token) = create_token(user.id, user_permissions.clone()).await?;

  let user_record = update_login_token_user_cache(
    &context,
    LoginTokenInsertForm {
      user_id: user.id,
      ip: get_user_ip(&req),
      token_hash: hash_passwrod(&refresh_token)?,
    },
    user,
    user_permissions,
  )
  .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    user: user_record,
  }))
}

pub async fn insert_new_user(pool: &Database, insert_form: UserInsertForm) -> KalamcheResult<User> {
  let user = User::insert(pool, insert_form).await?;

  let default_permissions = Permission::find_default_permission(pool).await?;
  UserPermission::insert_with_default_permission(pool, user.id, default_permissions).await?;

  Ok(user)
}
