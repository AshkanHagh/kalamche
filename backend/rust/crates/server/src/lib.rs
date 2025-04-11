use actix_cors::Cors;
use actix_web::{
  middleware::{self, Logger},
  web::Data,
  App, HttpServer,
};
use api_common::context::KalamcheContext;
use db_schema::{connection::build_pool, schema_setup::migration};
use utils::{
  cache::Peak,
  error::{KalamcheErrorType, KalamcheResult},
  oauth::OAuthManager,
  payment::PaymentClient,
  rate_limit::RateLimiter,
  settings::SETTINGS,
};

pub mod routes_v1;

pub async fn strat_server() -> KalamcheResult<()> {
  env_logger::init();
  migration()?;

  let reqwest_client = reqwest::ClientBuilder::new()
    .redirect(reqwest::redirect::Policy::none())
    .build()
    .unwrap();
  let pool = build_pool()?;
  let cache = Peak::new(10_000, 60 * 5, 60);
  let rate_limiter = RateLimiter::new(&cache);
  let oauth = OAuthManager::new(
    SETTINGS
      .get_oauth()
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?,
    reqwest_client.clone(),
  )?;
  let payment_client = PaymentClient::new(&SETTINGS.get_payment(), &reqwest_client);

  let context = Data::new(KalamcheContext::new(
    pool,
    reqwest_client,
    oauth,
    payment_client,
  ));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
      .wrap(Logger::default())
      .wrap(config_cors())
      .wrap(middleware::Logger::default())
      .wrap(middleware::Compress::default())
      .app_data(context.clone())
      .configure(|cfg| routes_v1::routes_v1(cfg, &rate_limiter))
  })
  .bind(bind)?
  .workers(2)
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
