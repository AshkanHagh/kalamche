use actix_cors::Cors;
use actix_web::{middleware, web::Data, App, HttpServer};
use api_common::context::KalamcheContext;
use db_schema::{connection::build_pool, schema_setup::migration};
use utils::{
  error::{KalamcheErrorType, KalamcheResult},
  image::S3ImageClient,
  oauth::OAuthManager,
  payment::PaymentClient,
  rate_limit::RateLimiter,
  settings::SETTINGS,
};

pub mod routes_v1;

#[actix_web::main]
pub async fn main() -> KalamcheResult<()> {
  env_logger::init();
  migration()?;

  let reqwest_client = reqwest::ClientBuilder::new()
    .redirect(reqwest::redirect::Policy::none())
    .build()
    .unwrap();
  let pool = build_pool()?;
  let rate_limiter = RateLimiter::new();
  // make oauth disable if not oauth was configured
  let oauth = OAuthManager::new(
    SETTINGS
      .get_oauth()
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?,
    reqwest_client.clone(),
  )?;
  let payment_client = PaymentClient::new(&SETTINGS.get_payment(), &reqwest_client);
  let image_client = S3ImageClient::new(&SETTINGS.get_image());

  let context = Data::new(KalamcheContext::new(
    pool,
    reqwest_client,
    oauth,
    payment_client,
    image_client,
  ));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
      .wrap(middleware::Logger::default())
      .wrap(config_cors())
      .app_data(context.clone())
      .configure(|cfg| routes_v1::routes_v1(cfg, &rate_limiter))
  })
  .bind(bind)?
  .run()
  .await?;

  Ok(())
}

fn config_cors() -> Cors {
  Cors::default()
    .allowed_origin(&SETTINGS.allowed_origin_url)
    .supports_credentials()
    .allow_any_header()
    .allow_any_method()
}
