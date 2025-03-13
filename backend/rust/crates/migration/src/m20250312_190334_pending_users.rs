use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(PendingUser::Table)
          .col(
            ColumnDef::new(PendingUser::Id)
              .uuid()
              .primary_key()
              .not_null(),
          )
          .col(
            ColumnDef::new(PendingUser::Email)
              .string_len(255)
              .unique_key()
              .not_null(),
          )
          .col(ColumnDef::new(PendingUser::PasswordHash).string_len(300))
          .col(
            ColumnDef::new(PendingUser::Token)
              .string_len(300)
              .not_null(),
          )
          .col(
            ColumnDef::new(PendingUser::Published)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .to_owned(),
      )
      .await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(
        Table::drop()
          .table(PendingUser::Table)
          .if_exists()
          .cascade()
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
enum PendingUser {
  Table,
  Id,
  Email,
  PasswordHash,
  Token,
  Published,
}
