use actix_web::web::{scope, ServiceConfig};
use utils::rate_limit::RateLimiter;

pub fn routes_v1(cfg: &mut ServiceConfig, rate_limit: &RateLimiter) {
  cfg.service(
    scope("/auth")
      .wrap(rate_limit.register())
      .service(api::user::oauth_authorize::get_authorize_url)
      .service(api::user::refresh_token::refresh_token)
      .service(api::user::register::register)
      .service(api::user::login::login)
      .service(api_crud::user::create::authenticate_with_oauth)
      .service(api_crud::user::create::verify_email_registration),
  );
}
