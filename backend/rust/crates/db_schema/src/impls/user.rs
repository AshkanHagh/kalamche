use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::user::{User, UserInsertForm},
};

impl User {
  pub async fn find_by_email(
    pool: &mut DbPool<'_>,
    user_email: &str,
  ) -> KalamcheResult<Option<User>> {
    use crate::schema::users::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let user = users
      .filter(email.eq(user_email))
      .select(User::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(user)
  }

  pub async fn find_by_id(pool: &mut DbPool<'_>, user_id: Uuid) -> KalamcheResult<Option<User>> {
    use crate::schema::users::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let user = users
      .find(user_id)
      .select(User::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(user)
  }

  pub async fn insert(pool: &mut DbPool<'_>, form: UserInsertForm) -> KalamcheResult<User> {
    use crate::schema::users;
    let conn = &mut get_conn(pool).await?;
    let user = diesel::insert_into(users::table)
      .values(&form)
      .returning(User::as_returning())
      .get_result(conn)
      .await?;

    Ok(user)
  }

  pub async fn email_exists(pool: &mut DbPool<'_>, user_email: &str) -> KalamcheResult<()> {
    use crate::schema::users::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let exists = users
      .filter(email.eq(user_email))
      .select(User::as_select())
      .first::<User>(conn)
      .await
      .optional()?;

    if exists.is_some() {
      return Err(KalamcheError::from(KalamcheErrorType::EmailAlreadyExists));
    }
    Ok(())
  }
}
