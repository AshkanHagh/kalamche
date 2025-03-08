use config::error::KalamcheResult;
use server::strat_server;

#[actix_web::main]
async fn main() -> KalamcheResult<()> {
  strat_server().await
}
