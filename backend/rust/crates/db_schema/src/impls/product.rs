use diesel::SelectableHelper;
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;

use crate::{
  connection::{get_conn, DbPool},
  source::product::{Product, ProductInsertForm},
};

impl Product {
  pub async fn insert_many(
    pool: &mut DbPool<'_>,
    forms: Vec<ProductInsertForm>,
  ) -> KalamcheResult<Vec<Product>> {
    use crate::schema::products;
    let conn = &mut get_conn(pool).await?;

    let products = diesel::insert_into(products::table)
      .values(&forms)
      .returning(Product::as_select())
      .get_results(conn)
      .await?;

    Ok(products)
  }

  pub async fn fulltext_search(
    pool: &mut DbPool<'_>,
    query: &str,
    limit: i64,
    offset: i64,
  ) -> KalamcheResult<Vec<Product>> {
    use diesel_async::RunQueryDsl;
    let conn = &mut get_conn(pool).await?;

    let tsquery = query.replace(' ', " & ");
    let serach_result: Vec<Product> = diesel::sql_query(
      r#"
      SELECT id, shop_id, name, description, price, status, categories, specifications, website, likes, views, search_vector, created_at, updated_at
      FROM products
      WHERE search_vector @@ to_tsquery('english', $1)
      ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC
      LIMIT $2
      OFFSET $3
      "#
    )
    .bind::<diesel::sql_types::Text, _>(tsquery)
    .bind::<diesel::sql_types::BigInt, _>(limit)
    .bind::<diesel::sql_types::BigInt, _>(offset)
    .load::<Product>(conn)
    .await?;

    Ok(serach_result)
  }
}
