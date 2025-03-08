use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(Permission::Table)
          .col(ColumnDef::new(Permission::Id).primary_key().uuid())
          .col(ColumnDef::new(Permission::Name).string_len(50).not_null())
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(
        Table::drop()
          .table(Permission::Table)
          .if_exists()
          .restrict()
          .to_owned(),
      )
      .await
  }
}

#[derive(DeriveIden)]
pub enum Permission {
  Table,
  Id,
  Name,
}
