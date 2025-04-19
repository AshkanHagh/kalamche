use actix_web::{
  cookie::{time::Duration as CookieDuration, Cookie, CookieJar, SameSite},
  http::header::Header,
  HttpMessage, HttpRequest, HttpResponse,
};
use actix_web_httpauth::headers::authorization::{Authorization, Bearer};
use db_schema::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  user::User,
};
use db_view::structs::UserView;
use utils::{
  email::send_email,
  error::{KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    hash::hash_passwrod,
    token::{sign_access_token, sign_refresh_token, verify_access_token},
  },
};
use uuid::Uuid;

use crate::{context::KalamcheContext, user::MyUserInfo};

pub const ACCESS_COOKIE_NAME: &str = "access_token";
pub const REFRESH_COOKIE_NAME: &str = "refresh_token";
pub const ACCESS_COOKIE_DURATION: CookieDuration = CookieDuration::minutes(15);
pub const REFRESH_COOKIE_DURATION: CookieDuration = CookieDuration::days(2);

pub fn build_auth_cookie_jar(access_token: &str, refresh_token: &str) -> CookieJar {
  let mut access_token_cookie = Cookie::new(ACCESS_COOKIE_NAME, access_token.to_string());
  access_token_cookie.set_path("/");
  access_token_cookie.set_http_only(true);
  access_token_cookie.set_same_site(SameSite::Lax);
  access_token_cookie.set_max_age(ACCESS_COOKIE_DURATION);
  access_token_cookie.set_secure(false);

  let mut refresh_token_cookie = Cookie::new(REFRESH_COOKIE_NAME, refresh_token.to_string());
  refresh_token_cookie.set_path("/");
  refresh_token_cookie.set_http_only(true);
  refresh_token_cookie.set_same_site(SameSite::Lax);
  refresh_token_cookie.set_max_age(REFRESH_COOKIE_DURATION);
  refresh_token_cookie.set_secure(false);

  let mut jar = CookieJar::new();
  jar.add_original(access_token_cookie);
  jar.add_original(refresh_token_cookie);

  jar
}

pub async fn refresh_tokens(
  context: &KalamcheContext,
  req: &HttpRequest,
  user_id: Uuid,
) -> KalamcheResult<(String, String)> {
  let (access_token, refresh_token) =
    tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
      let access_token = sign_access_token(SETTINGS.get_jwt(), user_id)?;
      let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
      Ok((access_token, refresh_token))
    })
    .await??;

  LoginToken::insert_or_update(
    &mut context.pool(),
    LoginTokenInsertForm {
      user_id,
      ip: get_user_ip(req),
      token_hash: hash_passwrod(&refresh_token)?,
    },
  )
  .await?;

  Ok((access_token, refresh_token))
}
// pub async fn send_verification_email_if_required() {}
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

pub fn read_auth_token(req: &HttpRequest) -> KalamcheResult<Option<String>> {
  if let Ok(header) = Authorization::<Bearer>::parse(req) {
    Ok(Some(header.as_ref().token().to_string()))
  } else {
    Ok(None)
  }
}

pub async fn find_user_from_jwt(token: &str, context: &KalamcheContext) -> KalamcheResult<User> {
  let claims = verify_access_token(SETTINGS.get_jwt(), token)?;
  let user = User::find_by_id(&mut context.pool(), claims.sub)
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

pub async fn get_my_user(context: &KalamcheContext, user_id: Uuid) -> KalamcheResult<MyUserInfo> {
  let user_view = UserView::read(&mut context.pool(), user_id).await?;
  Ok(MyUserInfo { user_view })
}

pub fn set_cookie(jar: CookieJar, mut response: HttpResponse) -> KalamcheResult<HttpResponse> {
  for cookie in jar.iter() {
    response.add_cookie(cookie)?;
  }
  Ok(response)
}
