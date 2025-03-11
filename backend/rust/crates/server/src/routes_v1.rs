use actix_web::web::{scope, ServiceConfig};

pub fn routes_v1(cfg: &mut ServiceConfig) {
  cfg.service(
    scope("/auth")
      .service(api::user::oauth_authorize::get_authorize_url)
      .service(api::user::create::authenticate_with_oauth),
  );
}
