use entity::{permission, user_permission};
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::error::{KalamcheErrorType, KalamcheResult};

use crate::{
  connection::Database,
  source::{permission::Permission, user_permissin::UserPermission},
};

impl UserPermission {
  pub async fn insert_with_default_permission(
    pool: &Database,
    user_id: Uuid,
    permissions: Vec<Permission>,
  ) -> KalamcheResult<()> {
    let models = permissions
      .iter()
      .map(|permission| user_permission::ActiveModel {
        id: Set(Uuid::new_v4()),
        user_id: Set(user_id),
        permission_id: Set(permission.id),
      })
      .collect::<Vec<user_permission::ActiveModel>>();

    user_permission::Entity::insert_many(models)
      .exec(&*pool.0)
      .await?;

    Ok(())
  }

  pub async fn find_user_permissions(
    pool: &Database,
    user_id: Uuid,
  ) -> KalamcheResult<Vec<String>> {
    let user_permissions = user_permission::Entity::find()
      .filter(user_permission::Column::UserId.eq(user_id))
      .find_also_related(permission::Entity)
      .into_model::<UserPermission, Permission>()
      .all(&*pool.0)
      .await?;

    let permissions = user_permissions
      .into_iter()
      .map(|permission| -> KalamcheResult<String> {
        let permission = permission.1.ok_or(KalamcheErrorType::NotFound)?;
        Ok(permission.name)
      })
      .collect::<KalamcheResult<Vec<String>>>()?;

    Ok(permissions)
  }
}
