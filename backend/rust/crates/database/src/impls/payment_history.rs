use chrono::Utc;
use entity::payment_history::{self, Model};
use sea_orm::{prelude::*, ActiveValue::Set, EntityTrait, QueryFilter};
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::Database,
  source::payment_history::{PaymentHistory, PaymentHistoryInsertForm, PaymentHistoryUpdateForm},
};

impl PaymentHistory {
  pub async fn insert(pool: &Database, form: PaymentHistoryInsertForm) -> KalamcheResult<()> {
    // transaction_id: initial value set to "".
    let model = payment_history::ActiveModel {
      id: Set(Uuid::new_v4()),
      fr_token_id: Set(form.fr_token_id),
      user_id: Set(form.user_id),
      fr_tokens: Set(form.fr_tokens),
      price: Set(form.price),
      status: Set(form.status),
      session_id: Set(form.session_id),
      transaction_id: Set("".to_string()),
      created_at: Set(Utc::now().fixed_offset()),
    };

    let _ = payment_history::Entity::insert(model).exec(&**pool).await?;

    Ok(())
  }

  pub async fn find_by_session_id(
    pool: &Database,
    session_id: &str,
  ) -> KalamcheResult<PaymentHistory> {
    let payment_history = payment_history::Entity::find()
      .filter(payment_history::Column::SessionId.eq(session_id))
      .one(&**pool)
      .await?
      .ok_or(KalamcheErrorType::NotFound)?;

    Ok(PaymentHistory::try_from(payment_history)?)
  }

  pub async fn update(
    pool: &Database,
    id: Uuid,
    form: PaymentHistoryUpdateForm,
  ) -> KalamcheResult<PaymentHistory> {
    let payment_history = payment_history::Entity::find_by_id(id)
      .one(&**pool)
      .await?
      .ok_or(KalamcheErrorType::NotFound)?;

    let mut model: payment_history::ActiveModel = payment_history.into();
    model.status = Set(form.status);
    model.transaction_id = Set(form.transaction_id);

    let payment_history = model.update(&**pool).await?;
    Ok(PaymentHistory::try_from(payment_history)?)
  }
}

impl TryFrom<Model> for PaymentHistory {
  type Error = KalamcheError;

  fn try_from(model: Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      fr_token_id: model.fr_token_id,
      user_id: model.user_id,
      price: model.price,
      fr_tokens: model.fr_tokens,
      status: model.status,
      transaction_id: model.transaction_id,
      session_id: model.session_id,
      created_at: model.created_at,
    })
  }
}
