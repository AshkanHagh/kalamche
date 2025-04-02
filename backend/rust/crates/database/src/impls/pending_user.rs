use chrono::Utc;
use entity::pending_user;
use sea_orm::{prelude::*, ActiveValue::Set, EntityTrait};
use utils::error::{KalamcheErrorType, KalamcheResult};

use crate::{
  connection::Database,
  source::pending_user::{PendingUser, PendingUserInsertForm},
};

impl PendingUser {
  pub async fn insert(
    pool: &Database,
    insert_form: PendingUserInsertForm,
  ) -> KalamcheResult<PendingUser> {
    let model = pending_user::ActiveModel {
      id: Set(Uuid::new_v4()),
      email: Set(insert_form.email),
      password_hash: Set(insert_form.password_hash),
      token: Set(insert_form.token),
      created_at: Set(Utc::now().fixed_offset()),
    };

    let pending_user = pending_user::Entity::insert(model)
      .exec_with_returning(&**pool)
      .await?;

    Ok(PendingUser::try_from(pending_user)?)
  }

  pub async fn update_token(pool: &Database, user_id: Uuid, token: String) -> KalamcheResult<()> {
    let pending_user = pending_user::Entity::find_by_id(user_id)
      .one(&**pool)
      .await?;

    let mut model: pending_user::ActiveModel =
      pending_user.ok_or(KalamcheErrorType::NotFound)?.into();

    model.token = Set(token);
    let _ = model.update(&**pool).await?;

    Ok(())
  }

  pub async fn find_by_id(pool: &Database, id: Uuid) -> KalamcheResult<Option<PendingUser>> {
    let pending_user = pending_user::Entity::find_by_id(id)
      .into_model::<PendingUser>()
      .one(&**pool)
      .await?;

    Ok(pending_user)
  }

  pub async fn exists_by_email(pool: &Database, email: &str) -> KalamcheResult<bool> {
    let pending_user = pending_user::Entity::find()
      .filter(pending_user::Column::Email.eq(email))
      .into_model::<PendingUser>()
      .one(&**pool)
      .await?;

    Ok(pending_user.is_some())
  }

  pub async fn delete_by_id(pool: &Database, id: Uuid) -> KalamcheResult<()> {
    pending_user::Entity::delete_by_id(id).exec(&**pool).await?;
    Ok(())
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
      created_at: model.created_at,
    })
  }
}
