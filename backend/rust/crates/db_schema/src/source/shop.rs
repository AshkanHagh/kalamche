use chrono::{DateTime, Utc};
use diesel::pg;
use diesel::{prelude::Queryable, Selectable};
use diesel_derive_enum::DbEnum;
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, Selectable, Queryable, Clone)]
#[diesel(table_name = crate::schema::shops)]
#[diesel(check_for_backend(pg::Pg))]
pub struct Shop {
  pub id: Uuid,
  pub name: String,
  pub description: String,
  pub user_id: Uuid,
  pub email: String,
  pub email_verified_at: Option<DateTime<Utc>>,
  pub phone: String,
  pub website: String,
  pub street_address: String,
  pub city: String,
  pub state: String,
  pub zip_code: i32,
  pub tax_id: String,
  pub status: ShopStatus,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, PartialEq, Clone, DbEnum)]
#[ExistingTypePath = "crate::schema::sql_types::ShopStatus"]
pub enum ShopStatus {
  Active,
  Pending,
  Closed,
}
