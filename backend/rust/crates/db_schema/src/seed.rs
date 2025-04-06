use chrono::Utc;
use entity::{fr_token_plan, permission};
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

pub async fn seed_default_fr_token_plans(pool: &Database) -> KalamcheResult<()> {
  let default_models = vec![
    fr_token_plan::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set("Starter Pack".to_owned()),
      description: Set("Perfect for small businesses or beginners testing the waters. Get 300 clicks to promote your products and see results without breaking the bank.".to_owned()),
      fr_tokens: Set(300),
      price: Set(1500),
      price_per_fr_token: Set(5),
      created_at: Set(Utc::now().fixed_offset()),
    },

    fr_token_plan::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set("Growth Pack".to_owned()),
      description: Set("Scale up your reach with 1000 clicks. Ideal for growing businesses looking to boost product visibility and drive steady traffic.".to_owned()),
      fr_tokens: Set(1000),
      price: Set(4500),
      price_per_fr_token: Set(4),
      created_at: Set(Utc::now().fixed_offset()),
    },

    fr_token_plan::ActiveModel {
      id: Set(Uuid::new_v4()),
      name: Set("Pro Pack".to_owned()),
      description: Set("Dominate the market with 5000 clicks. Designed for high-volume advertisers who want maximum exposure at the best value per click.".to_owned()),
      fr_tokens: Set(5000),
      price: Set(20000),
      price_per_fr_token: Set(4),
      created_at: Set(Utc::now().fixed_offset()),
    }
  ];

  fr_token_plan::Entity::insert_many(default_models)
    .exec(&**pool)
    .await?;

  Ok(())
}
