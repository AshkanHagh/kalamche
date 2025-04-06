use uuid::Uuid;

pub struct CreateCheckout {
  pub url: String,
  pub payment_id: String,
}

pub struct ProductForm {
  pub id: Uuid,
  pub name: String,
  pub description: String,
  pub price: i64,
}

pub struct VerifyPayment {
  pub amount: i64,
  pub transaction_id: String,
  pub card_number: String,
}
