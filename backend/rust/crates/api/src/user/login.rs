use actix_web::{
  post,
  web::{Data, Json},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  user::{LoginResponse, Register, RegisterResponse},
  utils::{
    build_cookie, create_token, get_user_ip, send_account_verification_email,
    update_login_token_user_cache, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME,
  },
};
use chrono::{Duration, Utc};
use database::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  pending_user::{PendingUser, PendingUserInsertForm},
  user::User,
  user_permissin::UserPermission,
};
use utils::{
  error::{KalamcheErrorType, KalamcheResult},
  setting::SETTINGS,
  utils::{
    hash::{hash_passwrod, verify_passwrod},
    random::generate_random_string,
    token::sign_verification_token,
  },
};
use uuid::Uuid;

#[post("/login")]
pub async fn login(
  context: Data<KalamcheContext>,
  req: HttpRequest,
  Json(payload): Json<Register>,
) -> KalamcheResult<HttpResponse> {
  // TODO: validate password and email with regex

  let user = User::find_user_by_email(context.pool(), &payload.email)
    .await?
    .ok_or(KalamcheErrorType::AccountNotRegistered)?;

  verify_passwrod(
    &payload.password,
    &user
      .password_hash
      .as_ref()
      .ok_or(KalamcheErrorType::AccountUsesOAuth)?,
  )?;

  let login_token = LoginToken::find_by_user_id(context.pool(), user.id).await?;
  if Utc::now() - login_token.published.with_timezone(&Utc) >= Duration::hours(12) {
    let pending_user_id = Uuid::new_v4();
    let code = generate_random_string();
    let verification_token =
      sign_verification_token(SETTINGS.get_jwt(), pending_user_id, code.clone())?;

    PendingUser::insert(
      context.pool(),
      PendingUserInsertForm {
        id: pending_user_id,
        email: payload.email,
        token: verification_token.clone(),
        password_hash: None,
      },
    )
    .await?;

    send_account_verification_email(&user.email, &code).await?;
    return Ok(HttpResponse::Ok().json(RegisterResponse {
      success: true,
      verification_token,
    }));
  }

  let permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;
  let (access_token, refresh_token) = create_token(user.id, permissions.clone()).await?;

  let user_record = update_login_token_user_cache(
    &context,
    LoginTokenInsertForm {
      ip: get_user_ip(&req),
      user_id: user.id,
      token_hash: hash_passwrod(&refresh_token)?,
    },
    user,
    permissions.clone(),
  )
  .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    user: user_record,
  }))
}
