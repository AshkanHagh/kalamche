use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// application permissions
#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct Permission {
  pub id: Uuid,
  // resource name and access example(user:read)
  pub name: String,
}
