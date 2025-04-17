use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::{
    role::Role,
    user_role::{UserRole, UserRoleInsertForm},
  },
};

impl UserRole {
  pub async fn insert_with_default_role(
    pool: &mut DbPool<'_>,
    user_id: Uuid,
  ) -> KalamcheResult<()> {
    use crate::schema::user_roles;

    let default_roles = Role::find_default(pool).await?;
    let user_role_form = default_roles
      .into_iter()
      .map(|role| UserRoleInsertForm {
        role_id: role.id,
        user_id,
      })
      .collect::<Vec<UserRoleInsertForm>>();

    let conn = &mut get_conn(pool).await?;
    diesel::insert_into(user_roles::table)
      .values(user_role_form)
      .execute(conn)
      .await?;

    Ok(())
  }
}
