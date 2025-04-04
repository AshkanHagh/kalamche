pub use sea_orm_migration::prelude::*;

mod m20250307_203232_user;
mod m20250307_204900_permission;
mod m20250307_204908_user_permission;
mod m20250310_081058_oauth_account;
mod m20250310_081111_login_token;
mod m20250312_190334_pending_users;
mod m20250402_132748_fr_token_plans;
mod m20250402_132846_payment_histories;
mod m20250402_132905_wallets;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
            Box::new(m20250307_203232_user::Migration),
            Box::new(m20250307_204900_permission::Migration),
            Box::new(m20250307_204908_user_permission::Migration),
            Box::new(m20250310_081058_oauth_account::Migration),
            Box::new(m20250310_081111_login_token::Migration),
            Box::new(m20250312_190334_pending_users::Migration),
            Box::new(m20250402_132748_fr_token_plans::Migration),
            Box::new(m20250402_132846_payment_histories::Migration),
            Box::new(m20250402_132905_wallets::Migration),
        ]
  }
}
