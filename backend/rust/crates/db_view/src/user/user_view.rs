use db_schema::{
  connection::{get_conn, DbPool},
  source::{
    payment_history::PaymentHistory, user::User, user_permissin::UserPermission, wallet::Wallet,
  },
};
use diesel::{ExpressionMethods, JoinOnDsl, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::structs::{UserView, WalletView};

impl UserView {
  // move wallet view in it self view file
  // refactor this fn is to havy and must not query wallet stuf
  pub async fn read(pool: &mut DbPool<'_>, user_id: Uuid) -> KalamcheResult<Self> {
    use db_schema::schema::payment_history;
    use db_schema::schema::users::dsl::users;
    use db_schema::schema::wallets::dsl::{self as wallet_dsl, wallets};

    let user_permissions = UserPermission::find_permissions_str_by_user_id(pool, user_id).await?;

    let conn = &mut get_conn(pool).await?;
    let user: User = users
      .find(user_id)
      .select(User::as_select())
      .first(conn)
      .await?;

    let (wallet, payment_history) = wallets
      .filter(wallet_dsl::user_id.eq(user_id))
      .left_join(payment_history::table.on(wallet_dsl::id.eq(payment_history::user_id)))
      .select((Wallet::as_select(), Option::<PaymentHistory>::as_select()))
      .first(conn)
      .await?;

    Ok(Self {
      user,
      permissions: user_permissions,
      wallet: WalletView {
        wallet,
        payment_history,
      },
    })
  }
}
