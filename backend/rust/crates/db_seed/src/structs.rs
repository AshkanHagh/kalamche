use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
  pub url: String,
  pub title: String,
  pub rating: f32,
  pub reviews: u32,
  pub initial_price: String, // Using String to handle "0" and large numbers
  pub final_price: String,   // Using String to handle large numbers
  pub currency: String,
  pub image: Vec<String>, // Array of image URLs
  pub seller_name: String,
  pub breadcrumb: Vec<String>, // Array of category names
  pub product_specifications: Vec<HashMap<String, String>>, // Array of key-value pairs
  pub product_description: String,
  pub seller_ratings: f32,
  pub seller_ship_on_time: String, // Percentage as string (e.g., "100%")
  pub seller_chat_response: String, // Percentage as string (e.g., "100%")
  pub sku: String,
  pub mpn: String,
  pub colors: Option<Vec<String>>, // Nullable or empty array
  pub variations: Vec<HashMap<String, Vec<String>>>, // Array of variation objects
  pub color: String,               // Selected color or empty
  pub returns_and_warranty: Vec<String>, // Array of return/warranty policies
  pub is_super_seller: bool,
  pub promotions: Vec<String>, // Array of promotions
  pub brand: String,
  pub product_variation: Vec<HashMap<String, String>>, // Array of variation key-value pairs
  pub lazmall: bool,
  pub domain: String,
  pub number_sold: u32,
  pub gmv: u64, // Gross Merchandise Value, using u64 for large numbers
}
