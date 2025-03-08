use actix_web::{
  middleware,
  web::{scope, Data},
  App, HttpServer,
};
use adapters::oauth::github::GithubOAuth;
use api::{containter::AdaptersContainer, context::KalamcheContext};
use config::{error::KalamcheResult, setting::SETTINGS};
use database::{connection::Database, migration::run_migration};
use reqwest::Client;
use routes_v1::routes_v1;
use std::sync::Arc;

pub mod routes_v1;

pub async fn strat_server() -> KalamcheResult<()> {
  println!("Starting server");

  let pool = Database::new(&SETTINGS).await?;
  run_migration(&pool).await?;

  let client = Client::new();
  let oauth = GithubOAuth::new(&SETTINGS, client.clone())?;
  let adapters = AdaptersContainer::new(Arc::new(oauth));
  let context = Data::new(KalamcheContext::new(pool, client, adapters));

  let bind = (SETTINGS.bind, SETTINGS.port);
  HttpServer::new(move || {
    App::new()
      .wrap(middleware::Logger::default())
      .wrap(middleware::Compress::default())
      .app_data(context.clone())
      .service(scope("/v1/api").configure(routes_v1))
  })
  .bind(bind)?
  .workers(2)
  .run()
  .await?;

  Ok(())
}
