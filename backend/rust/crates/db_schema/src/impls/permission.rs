use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

use crate::{
  connection::{get_conn, DbPool},
  source::permission::Permission,
};

impl Permission {
  pub async fn find_default_permission(pool: &mut DbPool<'_>) -> KalamcheResult<Vec<Permission>> {
    use crate::schema::permissions::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let default_permissions = vec!["user:read", "product:read", "store:read"];
    let permission: Vec<Permission> = permissions
      .filter(name.eq_any(default_permissions))
      .select(Permission::as_select())
      .load(conn)
      .await?;

    if permission.is_empty() {
      return Err(KalamcheError::from(KalamcheErrorType::NotFound));
    }

    Ok(permission)
  }
}
