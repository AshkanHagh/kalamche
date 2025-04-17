use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
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

    let default_permissions = vec!["user", "shop", "product"];
    let permission: Vec<Permission> = permissions
      .filter(resource.eq_any(default_permissions))
      .select(Permission::as_select())
      .load(conn)
      .await?;

    if permission.is_empty() {
      return Err(KalamcheError::from(KalamcheErrorType::NotFound));
    }

    Ok(permission)
  }

  pub async fn find_default_permissions_name(pool: &mut DbPool<'_>) -> KalamcheResult<Vec<String>> {
    use crate::schema::permissions::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let default_permissions = vec!["user", "shop", "product"];
    let permission_names: Option<Vec<String>> = permissions
      .filter(resource.eq_any(default_permissions))
      .select(name)
      .load(conn)
      .await
      .optional()?;

    match permission_names {
      Some(names) => Ok(names),
      None => Err(KalamcheError::from(KalamcheErrorType::NotFound)),
    }
  }
}
