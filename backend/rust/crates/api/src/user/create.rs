use actix_web::{
  get, post,
  web::{Data, Json, Query},
  HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  oauth_provider::AuthenticateWithOAuth,
  user::{LoginResponse, Register, RegisterResponse},
  utils::{build_cookie, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME},
};
use database::source::{
  login_token::{LoginToken, LoginTokenForm},
  oauth_account::{OAuthAccount, OAuthAccountForm},
  pending_user::{PendingUser, PendingUserForm},
  permission::Permission,
  user::{InsertUserForm, User},
  user_permissin::UserPermission,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  setting::SETTINGS,
  utils::{
    email::send_email,
    hash::hash_passwrod,
    random::generate_random_string,
    token::{sign_access_token, sign_refresh_token, sign_verification_token},
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
      let user = User::insert(
        context.pool(),
        InsertUserForm {
          name: oauth_user.name,
          email: oauth_user.email,
          avatar_url: oauth_user.avatar_url,
          password_hash: None,
        },
      )
      .await?;

      let default_permissions = Permission::find_default_permission(context.pool()).await?;
      UserPermission::insert_with_default_permission(context.pool(), user.id, default_permissions)
        .await?;

      OAuthAccount::insert(
        context.pool(),
        OAuthAccountForm {
          user_id: user.id,
          oauth_user_id: oauth_user.id,
        },
      )
      .await?;

      user
    }
  };

  let user_permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;

  let (user_id, permission) = (user.id, user_permissions.clone());
  let (access_token, refresh_token) =
    tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
      let access_token = sign_access_token(SETTINGS.get_jwt(), user_id, permission)?;
      let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
      Ok((access_token, refresh_token))
    })
    .await??;

  LoginToken::insert(
    context.pool(),
    LoginTokenForm {
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
    PendingUserForm {
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
    &format!("<h1>{}<h1>", verification_code),
    SETTINGS.get_email(),
  )?;

  Ok(Json(RegisterResponse {
    success: true,
    verification_token,
  }))
}
