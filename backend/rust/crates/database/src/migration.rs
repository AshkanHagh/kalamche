use config::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};
use migration::{Migrator, MigratorTrait};

use crate::connection::Database;

pub async fn run_migration(pool: &Database) -> KalamcheResult<()> {
  Migrator::fresh(&*pool.0)
    .await
    .with_kalamche_type(KalamcheErrorType::FaildToMigrate)
}
