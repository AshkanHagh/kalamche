use diesel::result::{
  ConnectionResult,
  Error::{self as DieselError, QueryBuilderError},
};
use diesel_async::{
  pg::AsyncPgConnection,
  pooled_connection::{
    deadpool::{Object as PooledConnection, Pool},
    AsyncDieselConnectionManager, ManagerConfig,
  },
  AsyncConnection,
};
use futures_util::{future::BoxFuture, FutureExt};
use std::ops::{Deref, DerefMut};
use utils::{error::KalamcheResult, settings::SETTINGS};

pub type ActualDbPool = Pool<AsyncPgConnection>;

// References a pool or connection. Functions must take `&mut DbPool<'_>` to allow implicit
// reborrowing.
//
// https://github.com/rust-lang/rfcs/issues/1403
pub enum DbPool<'a> {
  Pool(&'a ActualDbPool),
  Conn(&'a mut AsyncPgConnection),
}

pub enum DbConn<'a> {
  Pool(PooledConnection<AsyncPgConnection>),
  Conn(&'a mut AsyncPgConnection),
}

pub async fn get_conn<'a, 'b: 'a>(pool: &'a mut DbPool<'b>) -> Result<DbConn<'a>, DieselError> {
  Ok(match pool {
    DbPool::Pool(pool) => DbConn::Pool(pool.get().await.map_err(|e| QueryBuilderError(e.into()))?),
    DbPool::Conn(conn) => DbConn::Conn(conn),
  })
}

impl Deref for DbConn<'_> {
  type Target = AsyncPgConnection;

  fn deref(&self) -> &Self::Target {
    match self {
      DbConn::Pool(conn) => conn.deref(),
      DbConn::Conn(conn) => conn.deref(),
    }
  }
}

impl DerefMut for DbConn<'_> {
  fn deref_mut(&mut self) -> &mut Self::Target {
    match self {
      DbConn::Pool(conn) => conn.deref_mut(),
      DbConn::Conn(conn) => conn.deref_mut(),
    }
  }
}

// Allows functions that take `DbPool<'_>` to be called in a transaction by passing `&mut
// conn.into()`
impl<'a> From<&'a mut AsyncPgConnection> for DbPool<'a> {
  fn from(value: &'a mut AsyncPgConnection) -> Self {
    DbPool::Conn(value)
  }
}

impl<'a, 'b: 'a> From<&'a mut DbConn<'b>> for DbPool<'a> {
  fn from(value: &'a mut DbConn<'b>) -> Self {
    DbPool::Conn(value.deref_mut())
  }
}

impl<'a> From<&'a ActualDbPool> for DbPool<'a> {
  fn from(value: &'a ActualDbPool) -> Self {
    DbPool::Pool(value)
  }
}

// async diesel dose not support sslmode
fn establish_connection(connection: &str) -> BoxFuture<ConnectionResult<AsyncPgConnection>> {
  let fut = async { Ok(AsyncPgConnection::establish(connection).await?) };

  fut.boxed()
}

pub fn build_pool() -> KalamcheResult<ActualDbPool> {
  let db_config = SETTINGS.get_database();

  let mut config = ManagerConfig::default();
  config.custom_setup = Box::new(establish_connection);
  let manager = AsyncDieselConnectionManager::<AsyncPgConnection>::new_with_config(
    &db_config.connection,
    config,
  );

  let pool = Pool::builder(manager)
    .max_size(db_config.pool_size)
    .build()?;

  Ok(pool)
}
