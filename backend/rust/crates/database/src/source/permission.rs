use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Permission {
  pub id: Uuid,
  pub name: String,
}
