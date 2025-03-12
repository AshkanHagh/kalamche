use chrono::Utc;
use entity::pending_user;
use sea_orm::{prelude::*, ActiveValue::Set, EntityTrait};
use utils::error::{KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{
  connection::Database,
  source::pending_user::{PendingUser, PendingUserForm},
};

impl PendingUser {
  pub async fn insert(
    pool: &Database,
    insert_form: PendingUserForm,
  ) -> KalamcheResult<PendingUser> {
    let model = pending_user::ActiveModel {
      id: Set(insert_form.id),
      email: Set(insert_form.email),
      password_hash: Set(insert_form.password_hash),
      token: Set(insert_form.token),
      published: Set(Utc::now().fixed_offset()),
    };

    let pending_user = pending_user::Entity::insert(model)
      .exec_with_returning(&**pool)
      .await?;

    Ok(PendingUser::try_from(pending_user)?)
  }

  pub async fn find_by_id(pool: &Database, id: Uuid) -> KalamcheResult<Option<PendingUser>> {
    let pending_user = pending_user::Entity::find_by_id(id)
      .into_model::<PendingUser>()
      .one(&**pool)
      .await?;

    Ok(pending_user)
  }

  pub async fn find_by_email(pool: &Database, email: &str) -> KalamcheResult<bool> {
    let pending_user = pending_user::Entity::find()
      .filter(pending_user::Column::Email.eq(email))
      .into_model::<PendingUser>()
      .one(&**pool)
      .await?;

    Ok(pending_user.is_some())
  }
}

impl TryFrom<pending_user::Model> for PendingUser {
  type Error = KalamcheErrorType;

  fn try_from(model: pending_user::Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      email: model.email,
      password_hash: model.password_hash,
      token: model.token,
      published: model.published,
    })
  }
}
