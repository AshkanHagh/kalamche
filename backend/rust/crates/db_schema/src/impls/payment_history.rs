use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::payment_history::{PaymentHistory, PaymentHistoryInsertForm, PaymentHistoryUpdateForm},
};

impl PaymentHistory {
  pub async fn insert(pool: &mut DbPool<'_>, form: PaymentHistoryInsertForm) -> KalamcheResult<()> {
    use crate::schema::payment_history;
    let conn = &mut get_conn(pool).await?;

    diesel::insert_into(payment_history::table)
      .values(&form)
      .execute(conn)
      .await?;

    Ok(())
  }

  pub async fn find_by_session_id(
    pool: &mut DbPool<'_>,
    session_id: &str,
  ) -> KalamcheResult<PaymentHistory> {
    use crate::schema::payment_history::dsl::{self, payment_history};
    let conn = &mut get_conn(pool).await?;
    let payment = payment_history
      .filter(dsl::session_id.eq(session_id))
      .select(PaymentHistory::as_select())
      .first(conn)
      .await?;

    Ok(payment)
  }

  pub async fn update(
    pool: &mut DbPool<'_>,
    payment_id: Uuid,
    form: PaymentHistoryUpdateForm,
  ) -> KalamcheResult<PaymentHistory> {
    use crate::schema::payment_history::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let payment = diesel::update(payment_history.find(payment_id))
      .set(form)
      .returning(PaymentHistory::as_returning())
      .get_result(conn)
      .await?;

    Ok(payment)
  }

  pub async fn find_last_by_user_id(
    pool: &mut DbPool<'_>,
    user_id: Uuid,
  ) -> KalamcheResult<Option<PaymentHistory>> {
    use crate::schema::payment_history::dsl::{self, payment_history};
    let conn = &mut get_conn(pool).await?;
    let last_payment = payment_history
      .filter(dsl::user_id.eq(user_id))
      .order(dsl::created_at.desc())
      .select(PaymentHistory::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(last_payment)
  }
}
