use config::{error::KalamcheResult, setting::structs::Settings};
use sea_orm::{ConnectOptions, Database as SeaOrmDatabase, DatabaseConnection};
use std::{ops::Deref, sync::Arc, time::Duration};

pub struct Database(pub Arc<DatabaseConnection>);

impl Database {
  pub async fn new(settings: &Settings) -> KalamcheResult<Self> {
    let mut ops = ConnectOptions::new(settings.database.connection.clone());

    ops
      .max_connections(settings.database.pool_size as u32)
      .max_lifetime(Duration::from_secs(10))
      .connect_timeout(Duration::from_secs(10))
      .acquire_timeout(Duration::from_secs(10))
      .idle_timeout(Duration::from_secs(10))
      .max_lifetime(Duration::from_secs(30));

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
