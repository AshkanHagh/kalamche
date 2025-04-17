use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::role_permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct RolePermission {
  pub role_id: Uuid,
  pub permission_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::role_permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UserPermissionInsertForm {
  pub role_id: Uuid,
  pub permission_id: Uuid,
}
