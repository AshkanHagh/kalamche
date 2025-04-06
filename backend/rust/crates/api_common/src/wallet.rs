use db_schema::source::payment_history::PaymentHistory;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct PurchaseFrToken {
  pub token_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPayment {
  // unique id from payment provider
  pub session_id: String,
  // some payment providers returns payment status and success
  // see docs: (https://help.zibal.ir/IPG/API/#status-codes)
  pub success_int: Option<i8>,
  pub status: Option<i16>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PurchaseFrTokenResponse {
  pub success: bool,
  pub url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPaymentResponse {
  pub success: bool,
  pub payment: PaymentHistory,
}
