use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct UserRole {
  pub user_id: Uuid,
  pub role_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::user_roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UserRoleInsertForm {
  pub user_id: Uuid,
  pub role_id: Uuid,
}
