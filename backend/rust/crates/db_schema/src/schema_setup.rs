use diesel::{Connection, PgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use utils::{error::KalamcheResult, settings::SETTINGS};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn migration() -> KalamcheResult<()> {
  let mut conn = PgConnection::establish(&SETTINGS.get_database().connection)?;
  conn.run_pending_migrations(MIGRATIONS).unwrap();

  Ok(())
}
