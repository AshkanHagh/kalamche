use entity::permission;
use sea_orm::prelude::*;
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

use crate::{connection::Database, source::permission::Permission};

impl Permission {
  pub async fn find_default_permission(pool: &Database) -> KalamcheResult<Vec<Permission>> {
    let default_permissions = vec!["user:read", "product:read", "store:read"];

    let permissions = permission::Entity::find()
      .filter(permission::Column::Name.is_in(default_permissions))
      .into_model::<Permission>()
      .all(&*pool.0)
      .await?;

    if permissions.len() == 0 {
      return Err(KalamcheError::from(KalamcheErrorType::NotFound));
    }

    Ok(permissions)
  }
}
