use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;

use crate::{
  connection::{get_conn, DbPool},
  source::role::Role,
};

impl Role {
  pub async fn find_default(pool: &mut DbPool<'_>) -> KalamcheResult<Vec<Role>> {
    use crate::schema::roles;
    let conn = &mut get_conn(pool).await?;

    let default_roles = vec!["user"];
    let default_roles = roles::table
      .filter(roles::name.eq_any(default_roles))
      .select(Role::as_select())
      .load(conn)
      .await?;

    Ok(default_roles)
  }
}
