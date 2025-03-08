use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPermission {
  pub id: Uuid,
  pub user_id: Uuid,
  pub permission_id: Uuid,
}
