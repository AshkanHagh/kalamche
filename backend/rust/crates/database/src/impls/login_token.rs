use chrono::Utc;
use entity::login_token;
use migration::OnConflict;
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::error::{KalamcheErrorType, KalamcheResult};

use crate::{
  connection::Database,
  source::login_token::{LoginToken, LoginTokenInsertForm},
};

impl LoginToken {
  pub async fn insert(pool: &Database, payload: LoginTokenInsertForm) -> KalamcheResult<()> {
    let model = login_token::ActiveModel {
      user_id: Set(payload.user_id),
      token_hash: Set(payload.token_hash.clone()),
      published: Set(Utc::now().fixed_offset()),
    };

    login_token::Entity::insert(model)
      .on_conflict(
        OnConflict::column(login_token::Column::UserId)
          .update_column(login_token::Column::TokenHash)
          .update_column(login_token::Column::Published)
          .to_owned(),
      )
      .exec(&*pool.0)
      .await?;

    Ok(())
  }

  pub async fn find_by_user_id(pool: &Database, user_id: Uuid) -> KalamcheResult<LoginToken> {
    let token = login_token::Entity::find()
      .filter(login_token::Column::UserId.eq(user_id))
      .one(&*pool.0)
      .await?
      .ok_or(KalamcheErrorType::NotLoggedIn)?;

    Ok(LoginToken::try_from(token)?)
  }
}

impl TryFrom<login_token::Model> for LoginToken {
  type Error = KalamcheErrorType;

  fn try_from(model: login_token::Model) -> Result<Self, Self::Error> {
    Ok(Self {
      user_id: model.user_id,
      token_hash: model.token_hash,
      published: model.published,
    })
  }
}
