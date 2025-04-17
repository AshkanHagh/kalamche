use actix_web::{
  post,
  web::{Data, Json},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  user::{Login, LoginPendingResponse, LoginResponse},
  utils::{
    build_cookie, get_my_user, refresh_tokens, send_account_verification_email, RT_COOKIE_MAX_AGE,
    RT_COOKIE_NAME,
  },
};
use chrono::{Duration, Utc};
use db_schema::source::{
  login_token::LoginToken,
  pending_user::{PendingUser, PendingUserInsertForm},
  user::User,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    hash::verify_passwrod,
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

  let user = User::find_by_email(&mut context.pool(), &payload.email)
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

  let login_token = LoginToken::find_by_user_id(&mut context.pool(), user.id).await?;
  // Login has two scenarios:
  // 1. If the user's last interaction with the app was more than 12 hours ago, they must log in using 2FA.
  // 2. If it was within 12 hours, a normal login is allowed.
  if Utc::now().signed_duration_since(login_token.created_at) >= Duration::hours(12) {
    let pending_user = PendingUser::exists_by_email(&mut context.pool(), &user.email).await?;
    if pending_user {
      return Err(KalamcheError::from(KalamcheErrorType::PendingToVerify));
    }

    let pending_user_form = PendingUserInsertForm {
      email: payload.email,
      token: "".to_owned(),
      password_hash: None,
    };
    let pending_user = PendingUser::insert(&mut context.pool(), pending_user_form).await?;

    let code = generate_verification_code();
    let verification_token = sign_verification_token(SETTINGS.get_jwt(), pending_user.id, code)?;

    PendingUser::update_token(
      &mut context.pool(),
      pending_user.id,
      verification_token.clone(),
    )
    .await?;

    send_account_verification_email(&user.email, code).await?;
    return Ok(HttpResponse::Ok().json(LoginPendingResponse {
      success: true,
      verification_token,
      verify_email_sent: true,
    }));
  }

  let (access_token, refresh_token) = refresh_tokens(&context, &req, user.id).await?;
  let my_user = get_my_user(&context, user.id).await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(LoginResponse {
    success: true,
    access_token,
    my_user,
    verify_email_sent: false,
  }))
}
