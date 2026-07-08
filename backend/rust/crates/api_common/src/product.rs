use db_schema::source::product::Product;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchProduct {
  pub search: String,
  pub related_search: Option<String>,
  pub pr_min: Option<i64>,
  pub pr_max: Option<i64>,
  pub brand: Option<String>,
  pub sort: SearchSort,
  pub limit: Option<i64>,
  pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SearchSort {
  Newest,
  Cheapest,
  Expensive,
  Popular,
}

#[derive(Debug, Serialize)]
pub struct SearchProductResponse {
  pub products: Vec<Product>,
}
