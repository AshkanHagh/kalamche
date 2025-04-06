use reqwest::Client;
use structs::{CreateCheckout, ProductForm};
use zibal::ZibalPayment;

use crate::{error::KalamcheResult, settings::structs::PaymentConfig};

pub mod structs;
pub mod zibal;

pub struct PaymentClient {
  pub client: ZibalPayment,
}

impl PaymentClient {
  pub fn new(config: &PaymentConfig, reqwest_client: &Client) -> Self {
    Self {
      client: ZibalPayment::new(config, reqwest_client),
    }
  }

  pub async fn create_checkout_url(
    &self,
    product_form: ProductForm,
  ) -> KalamcheResult<CreateCheckout> {
    self.client.create_checkout_url(product_form).await
  }

  pub async fn verify_payment(&self, session_id: &str) -> KalamcheResult<structs::VerifyPayment> {
    self.client.verify_payment(session_id).await
  }
}
