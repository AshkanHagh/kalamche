use actix_web::{
  post,
  web::{Data, Json},
};
use api_common::{
  context::KalamcheContext,
  wallet::{VerifyPayment, VerifyPaymentResponse},
};
use db_schema::source::{
  payment_history::{PaymentHistory, PaymentHistoryUpdateForm, PaymentStatus},
  wallet::{Wallet, WalletUpdateForm},
};
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

#[post("/verify")]
pub async fn verify_payment(
  context: Data<KalamcheContext>,
  query: Json<VerifyPayment>,
) -> KalamcheResult<Json<VerifyPaymentResponse>> {
  if let Some(success) = query.success_int {
    if success != 1 {
      return Err(KalamcheError::from(
        KalamcheErrorType::PaymentVerificationFailed,
      ));
    }
  }

  let payment_history =
    PaymentHistory::find_by_session_id(&mut context.pool(), &query.session_id).await?;
  if payment_history.status != PaymentStatus::Pending {
    return Err(KalamcheError::from(
      KalamcheErrorType::PaymentVerificationFailed,
    ));
  }

  let verify_payment = context
    .payment_client()
    .verify_payment(&query.session_id)
    .await?;

  let payment_form = PaymentHistoryUpdateForm {
    status: PaymentStatus::Completed,
    transaction_id: verify_payment.transaction_id,
  };
  let updated_payment_history =
    PaymentHistory::update(&mut context.pool(), payment_history.id, payment_form).await?;

  let wallet_form = WalletUpdateForm {
    fr_tokens: payment_history.fr_tokens,
  };
  let _ = Wallet::update_wallet(&mut context.pool(), payment_history.user_id, wallet_form).await?;

  Ok(Json(VerifyPaymentResponse {
    success: true,
    payment: updated_payment_history,
  }))
}
