use server::strat_server;
use utils::error::KalamcheResult;

#[actix_web::main]
async fn main() -> KalamcheResult<()> {
  strat_server().await
}
