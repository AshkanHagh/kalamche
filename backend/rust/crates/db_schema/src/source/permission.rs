use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Permission {
  pub id: Uuid,
  // resource name and access example(user:read)
  pub name: String,
  pub resource: String,
  pub action: String,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::permissions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PermissionInsertForm {
  pub name: String,
  pub resource: String,
  pub action: String,
}
