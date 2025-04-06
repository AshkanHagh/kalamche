use actix_web::{
  post,
  web::{Data, Json},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  user::{Login, LoginPendingResponse, LoginResponse},
  utils::{
    build_cookie, create_token, get_user_ip, send_account_verification_email,
    update_login_token_user_cache, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME,
  },
};
use chrono::{Duration, Utc};
use db_schema::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  pending_user::{PendingUser, PendingUserInsertForm},
  user::User,
  user_permissin::UserPermission,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    hash::{hash_passwrod, verify_passwrod},
    random::generate_verification_code,
    token::sign_verification_token,
    validation::{is_email_valid, is_password_valid},
  },
};

#[post("/login")]
pub async fn login(
  context: Data<KalamcheContext>,
  req: HttpRequest,
  Json(payload): Json<Login>,
) -> KalamcheResult<HttpResponse> {
  is_email_valid(&payload.email)?;
  is_password_valid(&payload.password)?;

  let user = User::find_user_by_email(context.pool(), &payload.email)
    .await?
    .ok_or(KalamcheErrorType::InvalidEmailAddress)?;

  let matches = verify_passwrod(
    &payload.password,
    &user
      .password_hash
      .as_ref()
      .ok_or(KalamcheErrorType::AccountUsesOAuth)?,
  )?;
  if !matches {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidEmailAddress));
  }

  let login_token = LoginToken::find_by_user_id(context.pool(), user.id).await?;
  if Utc::now() - login_token.created_at.with_timezone(&Utc) >= Duration::hours(12) {
    let pending_user = PendingUser::exists_by_email(context.pool(), &user.email).await?;
    if pending_user {
      return Err(KalamcheError::from(KalamcheErrorType::PendingToVerify));
    }

    let pending_user = PendingUser::insert(
      context.pool(),
      PendingUserInsertForm {
        email: payload.email,
        token: "".to_owned(),
        password_hash: None,
      },
    )
    .await?;

    let code = generate_verification_code();
    let verification_token = sign_verification_token(SETTINGS.get_jwt(), pending_user.id, code)?;

    PendingUser::update_token(context.pool(), pending_user.id, verification_token.clone()).await?;

    send_account_verification_email(&user.email, code).await?;
    return Ok(HttpResponse::Ok().json(LoginPendingResponse {
      success: true,
      verification_token,
      verify_email_sent: true,
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
    verify_email_sent: false,
  }))
}
