use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;

use crate::{
  connection::{get_conn, DbPool},
  source::oauth_account::{OAuthAccount, OAuthAccountInsertForm},
};

impl OAuthAccount {
  pub async fn insert(pool: &mut DbPool<'_>, form: OAuthAccountInsertForm) -> KalamcheResult<()> {
    use crate::schema::oauth_accounts;
    let conn = &mut get_conn(pool).await?;
    diesel::insert_into(oauth_accounts::table)
      .values(&form)
      .execute(conn)
      .await?;

    Ok(())
  }

  pub async fn find_by_oauth_id(
    pool: &mut DbPool<'_>,
    oauth_id: &str,
  ) -> KalamcheResult<Option<OAuthAccount>> {
    use crate::schema::oauth_accounts::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let account = oauth_accounts
      .filter(oauth_user_id.eq(oauth_id))
      .select(OAuthAccount::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(account)
  }
}
