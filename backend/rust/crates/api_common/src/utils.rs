use actix_web::cookie::{time::Duration as CookieDuration, Cookie, SameSite};

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
