use sea_orm_migration::prelude::*;

use crate::m20250307_203232_user::User;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(OauthAccount::Table)
          .col(
            ColumnDef::new(OauthAccount::OauthUserId)
              .string_len(50)
              .primary_key(),
          )
          .col(ColumnDef::new(OauthAccount::UserId).uuid().not_null())
          .to_owned(),
      )
      .await?;

    manager
      .create_index(
        Index::create()
          .table(OauthAccount::Table)
          .name("idx_oauth_account_user_id")
          .col(OauthAccount::UserId)
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_oauth_account_user")
          .from(OauthAccount::Table, OauthAccount::UserId)
          .to(User::Table, User::Id)
          .on_delete(ForeignKeyAction::Cascade)
          .to_owned(),
      )
      .await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(
        Table::drop()
          .table(OauthAccount::Table)
          .if_exists()
          .cascade()
          .to_owned(),
      )
      .await?;

    manager
      .drop_index(
        Index::drop()
          .name("idx_oauth_account_user_id")
          .table(OauthAccount::Table)
          .if_exists()
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_oauth_account_user")
          .table(OauthAccount::Table)
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
enum OauthAccount {
  Table,
  UserId,
  OauthUserId,
}
