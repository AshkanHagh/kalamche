use chrono::Utc;
use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::login_token::{LoginToken, LoginTokenInsertForm},
};

impl LoginToken {
  pub async fn insert_or_update(
    pool: &mut DbPool<'_>,
    form: LoginTokenInsertForm,
  ) -> KalamcheResult<()> {
    use crate::schema::login_tokens;
    let conn = &mut get_conn(pool).await?;
    diesel::insert_into(login_tokens::table)
      .values(&form)
      .on_conflict(login_tokens::user_id)
      .do_update()
      .set((
        login_tokens::token_hash.eq(&form.token_hash),
        login_tokens::created_at.eq(Utc::now()),
      ))
      .execute(conn)
      .await?;

    Ok(())
  }

  pub async fn find_by_user_id(pool: &mut DbPool<'_>, user_id: Uuid) -> KalamcheResult<LoginToken> {
    use crate::schema::login_tokens::dsl::{self, login_tokens};
    let conn = &mut get_conn(pool).await?;
    let token = login_tokens
      .filter(dsl::user_id.eq(user_id))
      .select(LoginToken::as_select())
      .first(conn)
      .await
      .with_kalamche_type(KalamcheErrorType::NotLoggedIn)?;

    Ok(token)
  }
}
