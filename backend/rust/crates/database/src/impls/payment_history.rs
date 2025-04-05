use entity::payment_hisotry::{self, Model};
use sea_orm::{ActiveValue::Set, EntityTrait};
use utils::error::{KalamcheError, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::Database,
  source::payment_history::{PaymentHistory, PaymentHistoryInsertForm},
};

impl PaymentHistory {
  pub async fn insert(pool: &Database, form: PaymentHistoryInsertForm) -> KalamcheResult<()> {
    let model = payment_hisotry::ActiveModel {
      id: Set(Uuid::new_v4()),
      fr_token_id: Set(form.fr_token_id),
      user_id: Set(form.user_id),
      fr_tokens: Set(form.fr_tokens),
      price: Set(form.price),
      status: Set(form.status),
      session_id: Set(form.session_id),
      ..Default::default()
    };

    let _ = payment_hisotry::Entity::insert(model).exec(&**pool).await?;

    Ok(())
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
