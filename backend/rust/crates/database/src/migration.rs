use std::time::Duration;

use migration::{Migrator, MigratorTrait};
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

use crate::{connection::Database, seed::seed_default_permissions};

pub async fn run_migration(pool: &Database) -> KalamcheResult<()> {
  Migrator::fresh(&*pool.0)
    .await
    .with_kalamche_type(KalamcheErrorType::FaildToMigrate)?;

  std::thread::sleep(Duration::from_secs(5));

  seed_default_permissions(pool).await
}
