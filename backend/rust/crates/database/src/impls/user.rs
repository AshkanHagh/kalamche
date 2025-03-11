use entity::user;
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::error::{KalamcheError, KalamcheResult};

use crate::{
  connection::Database,
  source::user::{InsertUserForm, User, UserRecord},
};

impl TryFrom<user::Model> for User {
  type Error = KalamcheError;

  fn try_from(model: user::Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      name: model.name,
      email: model.email,
      avatar_url: model.avatar_url,
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

  pub async fn find_by_id(pool: &Database, id: Uuid) -> KalamcheResult<Option<User>> {
    let user = user::Entity::find()
      .filter(user::Column::Id.eq(id))
      .into_model::<User>()
      .one(&*pool.0)
      .await?;

    Ok(user)
  }

  pub async fn insert(pool: &Database, insert_form: InsertUserForm) -> KalamcheResult<User> {
    let model = user::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set(insert_form.name),
      email: Set(insert_form.email),
      avatar_url: Set(insert_form.avatar_url),
      ..Default::default()
    };

    let user = user::Entity::insert(model)
      .exec_with_returning(&*pool.0)
      .await?;

    User::try_from(user)
  }
}
