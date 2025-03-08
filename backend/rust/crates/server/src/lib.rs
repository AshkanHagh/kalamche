use std::env;

use actix_web::{
  middleware,
  web::{scope, Data},
  App, HttpServer,
};
use api::context::KalamcheContext;
use database::{connection::Database, migration::run_migration};
use reqwest::Client;
use routes_v1::routes_v1;
use utils::{
  error::KalamcheResult,
  setting::SETTINGS,
  utils::{cache::RedisCache, oauth::GithubOAuth},
};

pub mod routes_v1;

pub async fn strat_server() -> KalamcheResult<()> {
  env_logger::init();
  log::info!("starting server");

  let pool = Database::new(&SETTINGS.get_database()).await?;
  run_migration(&pool).await?;

  let client = Client::new();
  let cache = RedisCache::new(&SETTINGS.get_cache()).await?;
  let oauth = GithubOAuth::new(&SETTINGS.get_oauth(), client.clone())?;
  let context = Data::new(KalamcheContext::new(pool, client, cache, oauth));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
      .wrap(middleware::Logger::default())
      .wrap(middleware::Compress::default())
      .app_data(context.clone())
      .configure(routes_v1)
  })
  .bind(bind)?
  .workers(2)
  .run()
  .await?;

  Ok(())
}
