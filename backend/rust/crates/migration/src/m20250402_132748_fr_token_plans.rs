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
          .table(FrTokenPlan::Table)
          .col(ColumnDef::new(FrTokenPlan::Id).uuid().primary_key())
          .col(ColumnDef::new(FrTokenPlan::Name).string_len(255).not_null())
          .col(
            ColumnDef::new(FrTokenPlan::Description)
              .string_len(500)
              .not_null(),
          )
          .col(ColumnDef::new(FrTokenPlan::FrTokens).integer().not_null())
          .col(ColumnDef::new(FrTokenPlan::Price).big_integer().not_null())
          .col(
            ColumnDef::new(FrTokenPlan::PricePerFrToken)
              .small_integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(FrTokenPlan::CreatedAt)
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
      .drop_table(
        Table::drop()
          .table(FrTokenPlan::Table)
          .if_exists()
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
pub enum FrTokenPlan {
  Table,
  Id,
  Name,
  Description,
  FrTokens,
  Price,
  PricePerFrToken,
  CreatedAt,
}
