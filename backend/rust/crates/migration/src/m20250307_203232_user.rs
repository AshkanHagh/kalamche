use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(User::Table)
          .col(ColumnDef::new(User::Id).uuid().primary_key())
          .col(ColumnDef::new(User::Name).string_len(255).not_null())
          .col(string_len(User::Email, 255).not_null())
          .col(ColumnDef::new(User::AvatarUrl).string_len(300).not_null())
          .col(ColumnDef::new(User::PasswordHash).string_len(300))
          .col(
            ColumnDef::new(User::CreatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .col(
            ColumnDef::new(User::UpdatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .to_owned(),
      )
      .await?;

    manager
      .create_index(
        Index::create()
          .name("idx_user_email")
          .table(User::Table)
          .col(User::Email)
          .if_not_exists()
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(
        Table::drop()
          .table(User::Table)
          .if_exists()
          .cascade()
          .to_owned(),
      )
      .await?;

    manager
      .drop_index(
        Index::drop()
          .name("idx_user_email")
          .table(User::Table)
          .if_exists()
          .to_owned(),
      )
      .await
  }
}

#[derive(DeriveIden)]
pub enum User {
  Table,
  Id,
  Name,
  Email,
  AvatarUrl,
  PasswordHash,
  CreatedAt,
  UpdatedAt,
}
