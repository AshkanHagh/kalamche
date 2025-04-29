use chrono::{DateTime, Utc};
use diesel::{
  pg,
  prelude::{AsChangeset, Insertable, Queryable},
  Selectable,
};
use diesel_derive_enum::DbEnum;
use diesel_json::Json;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Selectable, Queryable)]
#[diesel(table_name = crate::schema::products)]
#[diesel(check_for_backend(pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct Product {
  pub id: Uuid,
  pub shop_id: Uuid,
  pub name: String,
  pub description: String,
  pub price: f32,
  pub status: ProductStatus,
  pub categories: Vec<Option<String>>,
  pub specifications: Vec<Option<Json<ProductSpecification>>>,
  pub website: String,
  pub likes: i64,
  pub views: i64,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductSpecification {
  pub key: String,
  pub value: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, DbEnum)]
#[ExistingTypePath = "crate::schema::sql_types::ProductStatus"]
pub enum ProductStatus {
  Public,
  Draft,
}

#[derive(Debug, Clone, Serialize, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::products)]
#[diesel(check_for_backend(pg::Pg))]
pub struct ProductInsertForm {
  pub shop_id: Uuid,
  pub name: String,
  pub description: String,
  pub price: f32,
  pub status: ProductStatus,
  pub categories: Vec<Option<String>>,
  pub specifications: Vec<Option<Json<ProductSpecification>>>,
  pub website: String,
  pub likes: i64,
  pub views: i64,
}
