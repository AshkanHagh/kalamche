use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct UserPermission {
  pub id: Uuid,
  pub user_id: Uuid,
  pub permission_id: Uuid,
}
