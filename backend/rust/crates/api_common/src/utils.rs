use actix_web::{
  cookie::{time::Duration as CookieDuration, Cookie, SameSite},
  http::header::Header,
  HttpMessage, HttpRequest,
};
use actix_web_httpauth::headers::authorization::{Authorization, Bearer};
use database::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  user::{User, UserRecord},
};
use utils::{
  email::send_email,
  error::{KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::token::{sign_access_token, sign_refresh_token, verify_access_token},
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
    &format!("<h1>{}</h1>", code,),
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
  Ok(user_record)
}

pub fn read_auth_token(req: &HttpRequest) -> KalamcheResult<Option<String>> {
  if let Ok(header) = Authorization::<Bearer>::parse(req) {
    Ok(Some(header.as_ref().token().to_string()))
  } else {
    Ok(None)
  }
}

pub async fn find_user_from_jwt(token: &str, context: &KalamcheContext) -> KalamcheResult<User> {
  let claims = verify_access_token(SETTINGS.get_jwt(), token)?;
  let user = User::find_by_id(context.pool(), claims.sub)
    .await?
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  Ok(user)
}

pub fn get_user_from_req(req: &mut HttpRequest) -> KalamcheResult<User> {
  let user = req
    .extensions_mut()
    .remove::<User>()
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  Ok(user)
}
