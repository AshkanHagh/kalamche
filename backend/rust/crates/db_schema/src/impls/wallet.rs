// use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::wallet::{Wallet, WalletInsertForm, WalletUpdateForm},
};

impl Wallet {
  pub async fn update_wallet(
    pool: &mut DbPool<'_>,
    user_id: Uuid,
    mut form: WalletUpdateForm,
  ) -> KalamcheResult<Wallet> {
    use crate::schema::wallets;
    let conn = &mut get_conn(pool).await?;

    let current_fr_tokens: i32 = wallets::table
      .filter(wallets::user_id.eq(user_id))
      .select(wallets::fr_tokens)
      .first::<i32>(conn)
      .await?;
    form.fr_tokens += current_fr_tokens;

    let wallet = diesel::update(wallets::table.filter(wallets::user_id.eq(user_id)))
      .set(&form)
      .returning(Wallet::as_returning())
      .get_result(conn)
      .await?;

    Ok(wallet)
  }

  pub async fn find_by_user_id(pool: &mut DbPool<'_>, user_id: Uuid) -> KalamcheResult<Wallet> {
    // wallet always exists for user this might never throw error
    use crate::schema::wallets::dsl::{self, wallets};
    let conn = &mut get_conn(pool).await?;

    let wallet = wallets
      .filter(dsl::user_id.eq(user_id))
      .select(Wallet::as_select())
      .first(conn)
      .await?;

    Ok(wallet)
  }

  pub async fn insert_default_if_not_exists(
    pool: &mut DbPool<'_>,
    form: WalletInsertForm,
  ) -> KalamcheResult<Wallet> {
    use crate::schema::wallets;
    let conn = &mut get_conn(pool).await?;

    let wallet_exists = wallets::table
      .filter(wallets::user_id.eq(form.user_id))
      .select(Wallet::as_select())
      .first(conn)
      .await
      .optional()?;

    match wallet_exists {
      Some(wallet) => Ok(wallet),
      None => Ok(
        diesel::insert_into(wallets::table)
          .values(&form)
          .returning(Wallet::as_returning())
          .get_result(conn)
          .await?,
      ),
    }
  }
}
