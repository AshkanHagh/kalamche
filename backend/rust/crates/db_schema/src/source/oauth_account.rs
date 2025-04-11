use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::oauth_accounts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct OAuthAccount {
  pub oauth_user_id: String,
  pub user_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::oauth_accounts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct OAuthAccountInsertForm {
  pub oauth_user_id: String,
  pub user_id: Uuid,
}
