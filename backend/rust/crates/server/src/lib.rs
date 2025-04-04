use actix_cors::Cors;
use actix_web::{middleware, web::Data, App, HttpServer};
use api_common::context::KalamcheContext;
use database::{connection::Database, migration::run_migration};
use reqwest::Client;
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
  log::info!("starting server");

  let pool = Database::new(SETTINGS.get_database()).await?;
  run_migration(&pool).await?;

  let reqwest_client = Client::new();
  let cache = Peak::new(10_000, 60 * 5, 60);

  let rate_limiter = RateLimiter::new(&cache);
  let oauth = OAuthManager::new(
    SETTINGS
      .get_oauth()
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?,
    reqwest_client.clone(),
  )?;
  let payment_client = PaymentClient::new(&SETTINGS.get_payment());

  let context = Data::new(KalamcheContext::new(
    pool,
    reqwest_client,
    oauth,
    payment_client,
  ));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
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
}
