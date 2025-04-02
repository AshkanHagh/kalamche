use sea_orm::{ConnectOptions, Database as SeaOrmDatabase, DatabaseConnection};
use std::{ops::Deref, sync::Arc, time::Duration};
use utils::{error::KalamcheResult, settings::structs::DatabaseConfig};

pub struct Database(pub Arc<DatabaseConnection>);

impl Database {
  pub async fn new(config: &DatabaseConfig) -> KalamcheResult<Self> {
    let mut ops = ConnectOptions::new(config.connection.clone());

    ops
      .max_connections(config.pool_size)
      .max_lifetime(Duration::from_secs(config.max_lifetime))
      .connect_timeout(Duration::from_secs(config.connect_timeout))
      .acquire_timeout(Duration::from_secs(config.acquire_timeout))
      .idle_timeout(Duration::from_secs(config.idle_timeout));

    let connection = Arc::new(SeaOrmDatabase::connect(ops).await?);
    Ok(Self(connection))
  }
}

impl Deref for Database {
  type Target = DatabaseConnection;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

impl From<DatabaseConnection> for Database {
  fn from(db: DatabaseConnection) -> Self {
    let db_conn = Arc::new(db);
    Database(db_conn)
  }
}
