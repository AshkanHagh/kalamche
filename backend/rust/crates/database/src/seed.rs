use entity::permission;
use sea_orm::{ActiveValue::Set, EntityTrait};
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::connection::Database;

pub async fn seed_default_permissions(pool: &Database) -> KalamcheResult<()> {
  let default_permissions = vec!["user:read", "product:read", "store:read"];
  let models = default_permissions
    .iter()
    .map(|permission| permission::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set(permission.to_string()),
    })
    .collect::<Vec<permission::ActiveModel>>();

  permission::Entity::insert_many(models)
    .exec(&*pool.0)
    .await?;

  Ok(())
}
