use super::deserialize::{deserialize_json_vec_specification, deserialize_json_vec_string};
use core::time;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ProductSpecification {
  pub name: String,
  pub value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct LazadaProduct {
  pub url: String,
  pub title: String,
  pub rating: Option<f32>,
  pub reviews: u32,
  pub initial_price: Option<String>,
  pub final_price: String,
  pub currency: String,
  #[serde(deserialize_with = "deserialize_json_vec_string")]
  pub image: Vec<String>,
  pub seller_name: String,
  #[serde(deserialize_with = "deserialize_json_vec_string")]
  pub breadcrumb: Vec<String>,
  #[serde(deserialize_with = "deserialize_json_vec_specification")]
  pub product_specifications: Vec<ProductSpecification>,
  pub product_description: String,
  pub seller_ratings: Option<f32>,
  pub seller_ship_on_time: Option<String>,
  pub seller_chat_response: Option<String>,
  pub sku: String,
  pub mpn: String,
  pub colors: Option<String>,
  pub variations: String,
  pub color: Option<String>,
  pub returns_and_warranty: String,
  pub is_super_seller: bool,
  pub promotions: String,
  pub brand: String,
  pub product_variation: String,
  pub lazmall: bool,
  pub domain: String,
  pub number_sold: u32,
  pub gmv: Option<f64>,
}

#[derive(Debug)]
pub struct ImportStats {
  pub total_products: usize,
  pub total_inserts: usize,
  pub elapsed_time: time::Duration,
}
