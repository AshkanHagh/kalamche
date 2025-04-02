use actix_web::{
  cookie::{time::Duration as CookieDuration, Cookie, SameSite},
  HttpRequest,
};
use database::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  user::{User, UserRecord},
};
use utils::{
  email::send_email,
  error::KalamcheResult,
  settings::SETTINGS,
  utils::token::{sign_access_token, sign_refresh_token},
};
use uuid::Uuid;

use crate::context::KalamcheContext;

pub const RT_COOKIE_NAME: &str = "refresh_token";
pub const RT_COOKIE_MAX_AGE: CookieDuration = CookieDuration::days(2);

pub fn build_cookie<'a>(value: &'a str, name: &'a str, duration: CookieDuration) -> Cookie<'a> {
  let mut cookie = Cookie::new(name, value);
  cookie.set_path("/");
  cookie.set_http_only(true);
  cookie.set_same_site(SameSite::Lax);
  cookie.set_max_age(duration);
  cookie.set_secure(false);

  cookie
}

pub async fn create_token(
  user_id: Uuid,
  permissions: Vec<String>,
) -> KalamcheResult<(String, String)> {
  let (access_token, refresh_token) =
    tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
      let access_token = sign_access_token(SETTINGS.get_jwt(), user_id, permissions)?;
      let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
      Ok((access_token, refresh_token))
    })
    .await??;

  Ok((access_token, refresh_token))
}

pub async fn send_account_verification_email(email: &str, code: u32) -> KalamcheResult<()> {
  send_email(
    "verification code",
    email,
    &format!(
      "<h1>{}</h1>\n<h1>url: {}?code={}</h1>",
      code,
      SETTINGS.get_jwt().verification_redirect_url,
      code,
    ),
    SETTINGS.get_email(),
  )
}

pub fn get_user_ip(req: &HttpRequest) -> String {
  if let Some(forward) = req.headers().get("X-Forwarded-For") {
    if let Ok(forward_str) = forward.to_str() {
      return forward_str
        .split(',')
        .next()
        .unwrap_or("")
        .trim()
        .to_string();
    }
  };

  req
    .peer_addr()
    .map(|addr| addr.ip().to_string())
    .unwrap_or_else(|| "127.0.0.1".to_string())
}

pub async fn update_login_token_user_cache(
  context: &KalamcheContext,
  insert_form: LoginTokenInsertForm,
  user: User,
  permissions: Vec<String>,
) -> KalamcheResult<UserRecord> {
  LoginToken::insert(context.pool(), insert_form).await?;

  let user_record = User::into_record(user, permissions);
  context
    .cache
    .set(
      format!("user:{}", user_record.id).as_ref(),
      &user_record,
      Some(60 * 60 * 24),
    )
    .await?;

  Ok(user_record)
}
