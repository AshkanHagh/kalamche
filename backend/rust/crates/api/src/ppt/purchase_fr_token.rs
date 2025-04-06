use actix_web::{
  get,
  web::{Data, Json, Path},
  HttpRequest,
};
use api_common::{
  context::KalamcheContext,
  utils::get_user_from_req,
  wallet::{PurchaseFrToken, PurchaseFrTokenResponse},
};
use db_schema::source::{
  fr_token_plan::FrTokenPlan,
  payment_history::{PaymentHistory, PaymentHistoryInsertForm, PaymentStatus},
};
use utils::{error::KalamcheResult, payment::structs::ProductForm};

#[get("/{token_id}")]
pub async fn create_checkout(
  mut req: HttpRequest,
  context: Data<KalamcheContext>,
  params: Path<PurchaseFrToken>,
) -> KalamcheResult<Json<PurchaseFrTokenResponse>> {
  let user = get_user_from_req(&mut req)?;

  let fr_token_plan = FrTokenPlan::find_by_id(context.pool(), params.token_id).await?;
  let checkout_session = context
    .payment_client()
    .create_checkout_url(ProductForm {
      id: fr_token_plan.id,
      name: fr_token_plan.name,
      description: fr_token_plan.description,
      price: fr_token_plan.price,
    })
    .await?;

  // session_id: payment provider unique id like(session id, authrizity key)
  PaymentHistory::insert(
    context.pool(),
    PaymentHistoryInsertForm {
      user_id: user.id,
      fr_token_id: fr_token_plan.id,
      session_id: checkout_session.payment_id,
      fr_tokens: fr_token_plan.fr_tokens,
      price: fr_token_plan.price,
      status: PaymentStatus::Pending,
    },
  )
  .await?;

  Ok(Json(PurchaseFrTokenResponse {
    success: true,
    url: checkout_session.url,
  }))
}
