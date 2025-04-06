use chrono::NaiveDateTime;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
  error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  settings::structs::PaymentConfig,
};

use super::structs::{self, CreateCheckout, ProductForm};

// Zibal payment struct for interacting with the Zibal API.
// See: https://help.zibal.ir/IPG/API/
pub struct ZibalPayment {
  pub(crate) client: Client,
  pub(crate) config: PaymentConfig,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PaymentRequestForm {
  merchant: String,
  amount: i64,
  callback_url: String,
  description: Option<String>,
  order_id: Option<Uuid>,
  mobile: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PaymentRequestResponse {
  track_id: i64,
  result: u8,
  message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct VerifyPayment {
  merchant: String,
  track_id: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(unused)]
struct VerifyPaymentResponse {
  paid_at: NaiveDateTime,
  card_number: Option<String>,
  status: i8,
  amount: i64,
  ref_number: Option<i32>,
  description: String,
  order_id: Uuid,
  result: i16,
  message: String,
}

impl ZibalPayment {
  pub fn new(config: &PaymentConfig, reqwest_client: &Client) -> Self {
    Self {
      client: reqwest_client.clone(),
      config: config.clone(),
    }
  }

  pub async fn create_checkout_url(
    &self,
    product_form: ProductForm,
  ) -> KalamcheResult<CreateCheckout> {
    let payment_res = self
      .client
      .post("https://gateway.zibal.ir/v1/request")
      .json(&PaymentRequestForm {
        merchant: self.config.secret.clone(),
        callback_url: self.config.success_url.clone(),
        amount: product_form.price,
        description: Some(product_form.description),
        order_id: Some(product_form.id),
        mobile: None,
      })
      .send()
      .await?
      .json::<PaymentRequestResponse>()
      .await?;

    if payment_res.result != 100 || payment_res.message != "success" {
      return Err(KalamcheError::from(KalamcheErrorType::PaymentGatewayFailed));
    }

    let payment_gateway_url = format!("https://gateway.zibal.ir/start/{}", payment_res.track_id);
    Ok(CreateCheckout {
      url: payment_gateway_url,
      payment_id: payment_res.track_id.to_string(),
    })
  }

  pub async fn verify_payment(&self, session_id: &str) -> KalamcheResult<structs::VerifyPayment> {
    let verify_res = self
      .client
      .post("https://gateway.zibal.ir/v1/verify")
      .json(&VerifyPayment {
        merchant: self.config.secret.clone(),
        track_id: session_id
          .parse()
          .with_kalamche_type(KalamcheErrorType::PaymentVerificationFailed)?,
      })
      .send()
      .await?
      .json::<VerifyPaymentResponse>()
      .await?;

    if verify_res.result != 100 {
      return Err(KalamcheError::from(
        KalamcheErrorType::PaymentVerificationFailed,
      ));
    }

    Ok(structs::VerifyPayment {
      amount: verify_res.amount,
      card_number: verify_res.card_number.unwrap_or("62741****44".to_owned()),
      transaction_id: session_id.to_owned(),
    })
  }
}
