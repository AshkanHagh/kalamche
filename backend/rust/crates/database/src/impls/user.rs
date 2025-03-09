use entity::user;
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::{
  error::{KalamcheError, KalamcheResult},
  utils::oauth::OAuthUser,
};

use crate::{
  connection::Database,
  source::user::{User, UserRecord},
};

impl TryFrom<user::Model> for User {
  type Error = KalamcheError;

  fn try_from(model: user::Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      name: model.name,
      email: model.email,
      avatar_url: model.avatar_url,
      refresh_token_hash: model.refresh_token_hash,
      last_login: model.last_login,
      created_at: model.created_at,
      updated_at: model.updated_at,
    })
  }
}

impl User {
  pub fn into_record(model: User, permissions: Vec<String>) -> UserRecord {
    UserRecord {
      id: model.id,
      name: model.name,
      email: model.email,
      avatar_url: model.avatar_url,
      permissions,
      created_at: model.created_at,
    }
  }

  pub async fn find_user_by_email(pool: &Database, email: &str) -> KalamcheResult<Option<User>> {
    let user = user::Entity::find()
      .filter(user::Column::Email.eq(email))
      .into_model::<User>()
      .one(&*pool.0)
      .await?;

    Ok(user)
  }

  pub async fn insert_by_oauth_detail(pool: &Database, payload: OAuthUser) -> KalamcheResult<User> {
    let model = user::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set(payload.name),
      email: Set(payload.email),
      avatar_url: Set(payload.avatar_url),
      ..Default::default()
    };

    let user = user::Entity::insert(model)
      .exec_with_returning(&*pool.0)
      .await?;

    User::try_from(user)
  }
}
