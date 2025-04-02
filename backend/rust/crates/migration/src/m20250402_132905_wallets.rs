use sea_orm_migration::prelude::*;

use crate::m20250307_203232_user::User;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .create_table(
        Table::create()
          .table(Wallet::Table)
          .col(ColumnDef::new(Wallet::Id).uuid().primary_key())
          .col(ColumnDef::new(Wallet::UserId).uuid().not_null())
          .col(ColumnDef::new(Wallet::FrTokens).integer().not_null())
          .col(
            ColumnDef::new(Wallet::CreatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .col(
            ColumnDef::new(Wallet::UpdatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_wallets_user_id")
          .from(Wallet::Table, Wallet::UserId)
          .on_delete(ForeignKeyAction::Cascade)
          .to(User::Table, User::Id)
          .to_owned(),
      )
      .await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .drop_table(Table::drop().table(Wallet::Table).if_exists().to_owned())
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_wallets_user_id")
          .table(Wallet::Table)
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
enum Wallet {
  Table,
  Id,
  UserId,
  FrTokens,
  CreatedAt,
  UpdatedAt,
}
