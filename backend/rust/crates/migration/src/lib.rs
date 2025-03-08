pub use sea_orm_migration::prelude::*;

mod m20250307_203232_user;
mod m20250307_204900_permission;
mod m20250307_204908_user_permission;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
            Box::new(m20250307_203232_user::Migration),
            Box::new(m20250307_204900_permission::Migration),
            Box::new(m20250307_204908_user_permission::Migration),
        ]
  }
}
