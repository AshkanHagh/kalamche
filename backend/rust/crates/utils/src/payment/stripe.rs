use stripe::{
  CheckoutSession, CheckoutSessionMode, Client, CreateCheckoutSession,
  CreateCheckoutSessionLineItems, CreateCustomer, CreatePrice, CreateProduct, Currency, Customer,
  CustomerId, IdOrCreate, ListCustomers, Price, Product,
};
use uuid::Uuid;

use crate::{
  error::KalamcheResult,
  settings::{structs::PaymentConfig, SETTINGS},
};

pub struct StripePayment {
  pub(crate) client: Client,
}

pub struct ProductForm {
  pub id: Uuid,
  pub name: String,
  pub description: String,
  pub price: i64,
}

impl StripePayment {
  pub fn new(config: &PaymentConfig) -> Self {
    Self {
      client: Client::new(&config.secret),
    }
  }

  pub async fn create_checkout_url(
    &self,
    user_email: &str,
    product_form: ProductForm,
  ) -> KalamcheResult<(String, String)> {
    let customer_id = self.find_or_create_user(user_email).await?;

    let product = {
      let mut product = CreateProduct::new(&product_form.name);
      product.description = Some(&product_form.description);
      Product::create(&self.client, product).await?
    };

    let price = {
      let mut price = CreatePrice::new(Currency::USD);
      price.product = Some(IdOrCreate::Id(&product.id));
      price.unit_amount = Some(product_form.price);
      price.expand = &["product"];
      Price::create(&self.client, price).await?
    };

    let checkout_session = {
      let mut session_params = CreateCheckoutSession::new();
      let mut success_url = SETTINGS.get_payment().success_url.clone();

      session_params.success_url = Some(&success_url);
      session_params.cancel_url = Some(&SETTINGS.get_payment().cancel_url);
      session_params.customer = Some(customer_id);
      session_params.mode = Some(CheckoutSessionMode::Payment);
      session_params.line_items = Some(vec![CreateCheckoutSessionLineItems {
        price: Some(price.id.to_string()),
        quantity: Some(1),
        ..Default::default()
      }]);

      let checkout = CheckoutSession::create(&self.client, session_params).await?;
      success_url.insert_str(
        success_url.len(),
        &format!("/{}/{}", product_form.id, checkout.id),
      );

      checkout
    };

    Ok((
      checkout_session.url.unwrap(),
      checkout_session.id.to_string(),
    ))
  }

  async fn find_or_create_user(&self, user_email: &str) -> KalamcheResult<CustomerId> {
    let customer = Customer::list(
      &self.client,
      &ListCustomers {
        email: Some(user_email),
        limit: Some(1),
        ..Default::default()
      },
    )
    .await?;

    let customer_id = match customer.data.iter().map(|c| c.id.clone()).nth(0) {
      Some(customer_id) => customer_id,
      None => {
        let customer = Customer::create(
          &self.client,
          CreateCustomer {
            email: Some(user_email),
            ..Default::default()
          },
        )
        .await?;

        customer.id
      }
    };

    Ok(customer_id)
  }
}
