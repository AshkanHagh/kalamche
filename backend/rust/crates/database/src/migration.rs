use log::info;
use migration::{Migrator, MigratorTrait};
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

use crate::{
  connection::Database,
  seed::{seed_default_fr_token_plans, seed_default_permissions},
};

pub async fn run_migration(pool: &Database) -> KalamcheResult<()> {
  info!("starting migration");
  Migrator::fresh(&*pool.0)
    .await
    .with_kalamche_type(KalamcheErrorType::FaildToMigrate)?;

  seed_default_permissions(pool).await?;
  seed_default_fr_token_plans(pool).await?;

  Ok(())
}
