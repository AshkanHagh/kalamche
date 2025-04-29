use diesel::{QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;

use crate::{
  connection::{get_conn, DbPool},
  source::shop::Shop,
};

impl Shop {
  pub async fn find_shops(pool: &mut DbPool<'_>) -> anyhow::Result<Vec<Shop>> {
    use crate::schema::shops;
    let conn = &mut get_conn(pool).await?;

    let shops = shops::table.select(Shop::as_select()).load(conn).await?;
    Ok(shops)
  }
}
