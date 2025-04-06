use entity::fr_token_plan::{self, Model};
use sea_orm::{EntityTrait, QuerySelect};
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::{connection::Database, source::fr_token_plan::FrTokenPlan};

impl FrTokenPlan {
  pub async fn find_by_id(pool: &Database, id: Uuid) -> KalamcheResult<FrTokenPlan> {
    let plan = fr_token_plan::Entity::find_by_id(id)
      .one(&**pool)
      .await?
      .ok_or(KalamcheErrorType::NotFound)?;

    Ok(FrTokenPlan::try_from(plan)?)
  }

  pub async fn list_all_plans(pool: &Database) -> KalamcheResult<Vec<FrTokenPlan>> {
    let plans = fr_token_plan::Entity::find()
      .limit(9)
      .into_model::<FrTokenPlan>()
      .all(&**pool)
      .await?;

    Ok(plans)
  }
}

impl TryFrom<Model> for FrTokenPlan {
  type Error = KalamcheError;

  fn try_from(model: Model) -> Result<Self, Self::Error> {
    Ok(Self {
      id: model.id,
      name: model.name,
      description: model.description,
      fr_tokens: model.fr_tokens,
      price_per_fr_token: model.price_per_fr_token,
      price: model.price,
      created_at: model.created_at,
    })
  }
}
