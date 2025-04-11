use diesel::{ExpressionMethods, JoinOnDsl, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::{
    permission::Permission,
    user_permissin::{UserPermission, UserPermissionInsertForm},
  },
};

impl UserPermission {
  pub async fn insert_with_default_permission(
    pool: &mut DbPool<'_>,
    user_id: Uuid,
  ) -> KalamcheResult<()> {
    use crate::schema::user_permissions;

    let permissions = Permission::find_default_permission(pool).await?;
    let form: Vec<UserPermissionInsertForm> = permissions
      .iter()
      .map(|permission| UserPermissionInsertForm {
        user_id,
        permission_id: permission.id,
      })
      .collect();

    let conn = &mut get_conn(pool).await?;
    diesel::insert_into(user_permissions::table)
      .values(&form)
      .execute(conn)
      .await?;

    Ok(())
  }

  pub async fn find_permissions_str_by_user_id(
    pool: &mut DbPool<'_>,
    user_id: Uuid,
  ) -> KalamcheResult<Vec<String>> {
    use crate::schema::permissions;
    use crate::schema::user_permissions::dsl::{self, user_permissions};
    let conn = &mut get_conn(pool).await?;

    let permissions = user_permissions
      .filter(dsl::user_id.eq(user_id))
      .inner_join(permissions::table.on(dsl::permission_id.eq(permissions::id)))
      .select((UserPermission::as_select(), Permission::as_select()))
      .load::<(UserPermission, Permission)>(conn)
      .await
      .with_kalamche_type(KalamcheErrorType::NotFound)?;

    let permissions_str = permissions
      .into_iter()
      .map(|(_, permission)| -> String { permission.name })
      .collect::<Vec<String>>();

    Ok(permissions_str)
  }
}
