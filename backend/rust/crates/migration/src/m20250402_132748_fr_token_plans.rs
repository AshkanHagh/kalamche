use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .create_table(
        Table::create()
          .table(FrToken::Table)
          .col(ColumnDef::new(FrToken::Id).uuid().primary_key())
          .col(ColumnDef::new(FrToken::Name).string_len(255).not_null())
          .col(
            ColumnDef::new(FrToken::Description)
              .string_len(500)
              .not_null(),
          )
          .col(ColumnDef::new(FrToken::FrTokens).integer().not_null())
          .col(ColumnDef::new(FrToken::Price).big_integer().not_null())
          .col(
            ColumnDef::new(FrToken::PricePerFrToken)
              .small_integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(FrToken::CreatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .to_owned(),
      )
      .await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .drop_table(Table::drop().table(FrToken::Table).if_exists().to_owned())
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
pub enum FrToken {
  Table,
  Id,
  Name,
  Description,
  FrTokens,
  Price,
  PricePerFrToken,
  CreatedAt,
}
