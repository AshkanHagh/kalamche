use stripe::{ProductForm, StripePayment};

use crate::{error::KalamcheResult, settings::structs::PaymentConfig};

pub mod stripe;

pub struct PaymentClient {
  pub client: StripePayment,
}

impl PaymentClient {
  pub fn new(config: &PaymentConfig) -> Self {
    Self {
      client: StripePayment::new(config),
    }
  }

  pub async fn create_checkout_url(
    &self,
    user_email: &str,
    product_form: ProductForm,
  ) -> KalamcheResult<String> {
    self
      .client
      .create_checkout_url(user_email, product_form)
      .await
  }
}
