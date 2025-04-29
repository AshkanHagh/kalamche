use diesel::SelectableHelper;
use diesel_async::RunQueryDsl;

use crate::{
  connection::{get_conn, DbPool},
  source::product::{Product, ProductInsertForm},
};

impl Product {
  pub async fn insert_many(
    pool: &mut DbPool<'_>,
    forms: Vec<ProductInsertForm>,
  ) -> anyhow::Result<Vec<Product>> {
    use crate::schema::products;
    let conn = &mut get_conn(pool).await?;

    let products = diesel::insert_into(products::table)
      .values(&forms)
      .returning(Product::as_select())
      .get_results(conn)
      .await?;

    Ok(products)
  }
}
