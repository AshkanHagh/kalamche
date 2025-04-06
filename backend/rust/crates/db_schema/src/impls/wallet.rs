use chrono::Utc;
use entity::wallet;
use sea_orm::{prelude::*, ActiveValue::Set, EntityTrait, QueryFilter};
use utils::error::{KalamcheError, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::Database,
  source::wallet::{Wallet, WalletInsertForm},
};

impl Wallet {
  pub async fn insert_or_update_wallet(
    pool: &Database,
    form: WalletInsertForm,
  ) -> KalamcheResult<Wallet> {
    let wallet = wallet::Entity::find()
      .filter(wallet::Column::UserId.eq(form.user_id))
      .one(&**pool)
      .await?;

    match wallet {
      None => {
        let model = wallet::ActiveModel {
          id: Set(Uuid::new_v4()),
          user_id: Set(form.user_id),
          fr_tokens: Set(form.fr_tokens),
          created_at: Set(Utc::now().fixed_offset()),
          updated_at: Set(Utc::now().fixed_offset()),
        };

        let wallet = wallet::Entity::insert(model)
          .exec_with_returning(&**pool)
          .await?;

        Ok(Wallet::try_from(wallet)?)
      }
      Some(wallet_model) => {
        let mut model: wallet::ActiveModel = wallet_model.into();
        model.fr_tokens = Set(form.fr_tokens);

        let wallet = model.update(&**pool).await?;
        Ok(Wallet::try_from(wallet)?)
      }
    }
  }
}

impl TryFrom<wallet::Model> for Wallet {
  type Error = KalamcheError;

  fn try_from(model: wallet::Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      user_id: model.user_id,
      fr_tokens: model.fr_tokens,
      created_at: model.created_at,
      updated_at: model.updated_at,
    })
  }
}
