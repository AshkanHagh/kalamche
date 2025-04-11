use actix_web::{
  get,
  web::{Data, Json},
};
use api_common::{context::KalamcheContext, wallet::ListAllPlansResponse};
use db_schema::source::fr_token_plan::FrTokenPlan;
use utils::error::KalamcheResult;

#[get("/plans")]
pub async fn list_all_plans(
  context: Data<KalamcheContext>,
) -> KalamcheResult<Json<ListAllPlansResponse>> {
  let plans = FrTokenPlan::list_all_plans(&mut context.pool()).await?;

  Ok(Json(ListAllPlansResponse {
    success: true,
    plans,
  }))
}
