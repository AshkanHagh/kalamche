use actix_web::web::{scope, ServiceConfig};

pub fn routes_v1(cfg: &mut ServiceConfig) {
  cfg.service(
    scope("/auth")
      .service(api::user::oauth_authorize::get_authorize_url)
      .service(api::user::refresh_token::refresh_token)
      .service(api::user::register::register)
      .service(api::user::login::login)
      .service(api_crud::user::create::authenticate_with_oauth)
      .service(api_crud::user::create::verify_email_registration),
  );
}
