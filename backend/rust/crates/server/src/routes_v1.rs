use actix_web::web::{scope, ServiceConfig};

pub fn routes_v1(cfg: &mut ServiceConfig) {
  cfg.service(
    scope("/auth")
      .service(api::user::create::create_auth_url)
      .service(api::user::create::authenticate_with_oauth),
  );
}
