use chrono::{DateTime, Utc};
use diesel::{pg, prelude::Queryable, Selectable};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, Selectable, Queryable, Clone)]
#[diesel(table_name = crate::schema::shop_rates)]
#[diesel(check_for_backend(pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct ShopRate {
  pub shop_id: Uuid,
  pub user_id: Uuid,
  pub rate: f64,
  pub created_at: DateTime<Utc>,
}
