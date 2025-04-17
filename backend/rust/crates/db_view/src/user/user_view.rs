use db_schema::{
  connection::{get_conn, DbPool},
  source::{payment_history::PaymentHistory, role::Role, user::User, wallet::Wallet},
};
use diesel::{ExpressionMethods, JoinOnDsl, PgSortExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::{KalamcheError, KalamcheErrorType, KalamcheResult};
use uuid::Uuid;

use crate::structs::{UserView, WalletView};

impl UserView {
  pub async fn read(pool: &mut DbPool<'_>, user_id: Uuid) -> KalamcheResult<Self> {
    use db_schema::schema::payment_history;
    use db_schema::schema::roles;
    use db_schema::schema::user_roles;
    use db_schema::schema::users;
    use db_schema::schema::wallets;
    let conn = &mut get_conn(pool).await?;

    let user_view: Vec<(User, Option<Role>, Option<Wallet>, Option<PaymentHistory>)> = users::table
      .filter(users::id.eq(user_id))
      .left_join(
        user_roles::table
          .inner_join(roles::table.on(user_roles::role_id.eq(roles::id)))
          .on(user_roles::user_id.eq(users::id)),
      )
      .left_join(wallets::table.on(wallets::user_id.eq(users::id)))
      .left_join(payment_history::table.on(payment_history::user_id.eq(users::id)))
      .order(payment_history::created_at.desc().nulls_last())
      .select((
        User::as_select(),
        Option::<Role>::as_select(),
        Option::<Wallet>::as_select(),
        Option::<PaymentHistory>::as_select(),
      ))
      .load::<(User, Option<Role>, Option<Wallet>, Option<PaymentHistory>)>(conn)
      .await?;

    if user_view.is_empty() {
      return Err(KalamcheError::from(KalamcheErrorType::NotFound));
    }

    let user = user_view[0].0.clone();
    let wallet = user_view[0].2.clone().unwrap();
    let payment_history = user_view[0].3.clone();

    let roles = user_view
      .into_iter()
      .filter_map(|(_, role, _, _)| role.map(|role| role.name))
      .collect::<Vec<String>>();

    Ok(Self {
      user,
      roles,
      wallet: WalletView {
        wallet,
        payment_history,
      },
    })
  }
}
