use diesel::{QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::fr_token_plan::FrTokenPlan,
};

impl FrTokenPlan {
  pub async fn find_by_id(pool: &mut DbPool<'_>, plan_id: Uuid) -> KalamcheResult<FrTokenPlan> {
    use crate::schema::fr_token_plans::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let plan = fr_token_plans
      .find(plan_id)
      .select(FrTokenPlan::as_select())
      .first(conn)
      .await?;

    Ok(plan)
  }

  pub async fn list_all_plans(pool: &mut DbPool<'_>) -> KalamcheResult<Vec<FrTokenPlan>> {
    use crate::schema::fr_token_plans::dsl::*;
    let conn = &mut get_conn(pool).await?;
    let plans = fr_token_plans
      .limit(9)
      .select(FrTokenPlan::as_select())
      .load(conn)
      .await?;

    Ok(plans)
  }
}
