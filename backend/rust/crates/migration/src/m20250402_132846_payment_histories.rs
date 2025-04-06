use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

use crate::{m20250307_203232_user::User, m20250402_132748_fr_token_plans::FrTokenPlan};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    // Replace the sample below with your own migration scripts
    manager
      .create_type(
        Type::create()
          .as_enum(PaymentStatus::Enum)
          .values([
            PaymentStatus::Completed,
            PaymentStatus::Pending,
            PaymentStatus::Faild,
          ])
          .to_owned(),
      )
      .await?;

    manager
      .create_table(
        Table::create()
          .table(PaymentHistory::Table)
          .col(ColumnDef::new(PaymentHistory::Id).uuid().primary_key())
          .col(ColumnDef::new(PaymentHistory::FrTokenId).uuid().not_null())
          .col(ColumnDef::new(PaymentHistory::UserId).uuid().not_null())
          .col(
            ColumnDef::new(PaymentHistory::Price)
              .big_integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHistory::FrTokens)
              .integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHistory::Status)
              .custom(PaymentStatus::Enum)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHistory::TransactionId)
              .string_len(100)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHistory::SessionId)
              .string_len(100)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHistory::CreatedAt)
              .timestamp_with_time_zone()
              .not_null(),
          )
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_payment_histories_fr_token_id")
          .from(PaymentHistory::Table, PaymentHistory::FrTokenId)
          .on_delete(ForeignKeyAction::Cascade)
          .to(FrTokenPlan::Table, FrTokenPlan::Id)
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_payment_histories_user_id")
          .from(PaymentHistory::Table, PaymentHistory::UserId)
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
      .drop_table(
        Table::drop()
          .table(PaymentHistory::Table)
          .if_exists()
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_payment_histories_user_id")
          .table(PaymentHistory::Table)
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_payment_histories_fr_token_id")
          .table(PaymentHistory::Table)
          .to_owned(),
      )
      .await?;

    manager
      .drop_type(
        Type::drop()
          .name(PaymentStatus::Enum)
          .if_exists()
          .to_owned(),
      )
      .await?;

    Ok(())
  }
}

#[derive(DeriveIden)]
enum PaymentHistory {
  Table,
  Id,
  FrTokenId,
  UserId,
  Price,
  FrTokens,
  Status,
  TransactionId,
  SessionId,
  CreatedAt,
}

#[derive(DeriveIden)]
pub enum PaymentStatus {
  #[sea_orm(iden = "payment_status")]
  Enum,
  #[sea_orm(iden = "COMPLETED")]
  Completed,
  #[sea_orm(iden = "PENDING")]
  Pending,
  #[sea_orm(iden = "FAILD")]
  Faild,
}
