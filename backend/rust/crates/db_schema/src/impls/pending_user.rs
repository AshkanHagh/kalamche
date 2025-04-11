use chrono::Utc;
use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::pending_user::{PendingUser, PendingUserInsertForm},
};

impl PendingUser {
  pub async fn insert(
    pool: &mut DbPool<'_>,
    form: PendingUserInsertForm,
  ) -> KalamcheResult<PendingUser> {
    use crate::schema::pending_users;
    let conn = &mut get_conn(pool).await?;

    let pending_user = diesel::insert_into(pending_users::table)
      .values(&form)
      .returning(PendingUser::as_select())
      .get_result(conn)
      .await?;

    Ok(pending_user)
  }

  pub async fn update_token(pool: &mut DbPool<'_>, id: Uuid, token: String) -> KalamcheResult<()> {
    use crate::schema::pending_users::dsl::{self, pending_users};
    let conn = &mut get_conn(pool).await?;

    diesel::update(pending_users.find(id))
      .set(dsl::token.eq(&token))
      .execute(conn)
      .await?;

    Ok(())
  }

  pub async fn find_by_id(
    pool: &mut DbPool<'_>,
    p_id: Uuid,
  ) -> KalamcheResult<Option<PendingUser>> {
    use crate::schema::pending_users::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let pending_user = pending_users
      .find(p_id)
      .select(PendingUser::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(pending_user)
  }

  pub async fn exists_by_email(pool: &mut DbPool<'_>, user_email: &str) -> KalamcheResult<bool> {
    use crate::schema::pending_users::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let pending_user: Option<PendingUser> = pending_users
      .filter(email.eq(user_email))
      .select(PendingUser::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(pending_user.is_some())
  }

  pub async fn delete_by_id(pool: &mut DbPool<'_>, p_id: Uuid) -> KalamcheResult<()> {
    use crate::schema::pending_users::dsl::*;
    let conn = &mut get_conn(pool).await?;

    diesel::delete(pending_users.find(p_id))
      .execute(conn)
      .await?;
    Ok(())
  }

  pub async fn find_by_email(
    pool: &mut DbPool<'_>,
    user_email: &str,
  ) -> KalamcheResult<Option<PendingUser>> {
    use crate::schema::pending_users::dsl::*;
    let conn = &mut get_conn(pool).await?;

    let pending_user = pending_users
      .filter(email.eq(user_email))
      .select(PendingUser::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(pending_user)
  }

  pub async fn update_created_at(pool: &mut DbPool<'_>, id: Uuid) -> KalamcheResult<()> {
    use crate::schema::pending_users::dsl::{self, pending_users};
    let conn = &mut get_conn(pool).await?;

    diesel::update(pending_users.find(id))
      .set(dsl::created_at.eq(Utc::now()))
      .execute(conn)
      .await?;

    Ok(())
  }
}
