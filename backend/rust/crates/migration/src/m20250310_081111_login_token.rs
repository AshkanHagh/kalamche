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
          .table(LoginToken::Table)
          .col(ColumnDef::new(LoginToken::UserId).uuid().primary_key())
          .col(
            ColumnDef::new(LoginToken::TokenHash)
              .string_len(300)
              .not_null(),
          )
          .col(
            ColumnDef::new(LoginToken::Published)
              .timestamp()
              .not_null()
              .default(Expr::current_timestamp()),
          )
          .to_owned(),
      )
      .await?;

    manager
      .create_index(
        Index::create()
          .table(LoginToken::Table)
          .name("idx_login_token_search")
          .col(LoginToken::UserId)
          .col(LoginToken::TokenHash)
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_login_token_user")
          .from(LoginToken::Table, LoginToken::UserId)
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
          .table(LoginToken::Table)
          .if_exists()
          .cascade()
          .to_owned(),
      )
      .await?;

    manager
      .drop_index(
        Index::drop()
          .name("idx_login_token_search")
          .table(LoginToken::Table)
          .if_exists()
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .table(LoginToken::Table)
          .name("fk_login_token_user")
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
enum LoginToken {
  Table,
  UserId,
  TokenHash,
  Published,
}
