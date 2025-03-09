use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
pub struct Permission {
  pub id: Uuid,
  pub name: String,
}
