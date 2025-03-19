use actix_web::{middleware, web::Data, App, HttpServer};
use api_common::{context::KalamcheContext, oauth_provider::OAuthManager};
use database::{connection::Database, migration::run_migration};
use reqwest::Client;
use utils::{
  error::{KalamcheErrorType, KalamcheResult},
  rate_limit::RateLimiter,
  setting::SETTINGS,
  utils::cache::RedisCache,
};

pub mod routes_v1;

pub async fn strat_server() -> KalamcheResult<()> {
  env_logger::init();
  log::info!("starting server");

  let pool = Database::new(&SETTINGS.get_database()).await?;
  run_migration(&pool).await?;

  let client = Client::new();
  let cache = RedisCache::new(SETTINGS.get_cache()).await?;
  let rate_limiter = RateLimiter::new(&cache);
  let oauth = OAuthManager::new(
    SETTINGS
      .get_oauth()
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthNotConfigured)?,
    client.clone(),
  )?;
  let context = Data::new(KalamcheContext::new(pool, client, cache, oauth));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
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
