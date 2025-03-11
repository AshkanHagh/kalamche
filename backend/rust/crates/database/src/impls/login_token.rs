use entity::login_token;
use migration::OnConflict;
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::error::KalamcheResult;

use crate::{
  connection::Database,
  source::login_token::{LoginToken, LoginTokenForm},
};

impl LoginToken {
  pub async fn insert(pool: &Database, payload: LoginTokenForm) -> KalamcheResult<()> {
    let model = login_token::ActiveModel {
      user_id: Set(payload.user_id),
      token_hash: Set(payload.token_hash),
      ..Default::default()
    };

    login_token::Entity::insert(model)
      .on_conflict(
        OnConflict::column(login_token::Column::UserId)
          .update_column(login_token::Column::TokenHash)
          .to_owned(),
      )
      .exec(&*pool.0)
      .await?;

    Ok(())
  }
}

impl From<login_token::Model> for LoginToken {
  fn from(model: login_token::Model) -> Self {
    Self {
      user_id: model.user_id,
      token_hash: model.token_hash,
      published: model.published,
    }
  }
}
