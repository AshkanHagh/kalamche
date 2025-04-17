use db_schema::source::{payment_history::PaymentHistory, user::User, wallet::Wallet};
use diesel::prelude::Queryable;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Queryable)]
#[serde(rename_all = "camelCase")]
pub struct UserView {
  #[serde(flatten)]
  pub user: User,
  pub roles: Vec<String>,
  pub wallet: WalletView,
}

#[derive(Debug, Serialize, Deserialize, Queryable)]
#[serde(rename_all = "camelCase")]
pub struct WalletView {
  #[serde(flatten)]
  pub wallet: Wallet,
  #[serde(rename = "last_transaction")]
  pub payment_history: Option<PaymentHistory>,
}
