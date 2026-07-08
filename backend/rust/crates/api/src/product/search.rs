use actix_web::{
  get,
  web::{Data, Path, Query},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  product::{SearchProduct, SearchProductResponse},
};
use db_schema::source::product::Product;
use tokio::io::AsyncReadExt;
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

pub async fn search(
  context: Data<KalamcheContext>,
  query: Query<SearchProduct>,
  req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let result = Product::fulltext_search(
    &mut context.pool(),
    &query.search,
    query.limit.unwrap_or(10),
    query.offset.unwrap_or(0),
  )
  .await?;
  Ok(HttpResponse::Ok().json(SearchProductResponse { products: result }))
}

async fn read_categories() -> KalamcheResult<Vec<String>> {
  let json = tokio::fs::read_to_string("crates/db_seed/datasets/categories.json")
    .await
    .with_kalamche_type(KalamcheErrorType::NotFound)?;

  let categories: Vec<String> =
    serde_json::from_str(&json).with_kalamche_type(KalamcheErrorType::NotFound)?;
  Ok(categories)
}
