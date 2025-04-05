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
