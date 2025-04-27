use chrono::{DateTime, Utc};
use diesel::{
  pg::Pg,
  prelude::{Insertable, Queryable},
  Selectable,
};
use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Queryable, Selectable, Clone)]
#[diesel(table_name = crate::schema::images)]
#[diesel(check_for_backend(Pg))]
#[serde(rename_all = "camelCase")]
pub struct Image {
  pub id: Uuid,
  pub hash: Option<String>,
  pub entity_id: Uuid,
  pub entity_type: EntityType,
  pub content_type: String,
  pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, DbEnum, Clone)]
#[ExistingTypePath = "crate::schema::sql_types::EntityType"]
#[serde(rename_all = "lowercase")]
pub enum EntityType {
  User,
  Product,
}

#[derive(Debug, Serialize, Insertable)]
#[diesel(table_name = crate::schema::images)]
#[diesel(check_for_backend(Pg))]
pub struct ImageInsertForm {
  pub hash: Option<String>,
  pub entity_id: Uuid,
  pub entity_type: EntityType,
  pub content_type: String,
}
