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
          .table(PaymentHisotry::Table)
          .col(ColumnDef::new(PaymentHisotry::Id).uuid().primary_key())
          .col(ColumnDef::new(PaymentHisotry::FrTokenId).uuid().not_null())
          .col(ColumnDef::new(PaymentHisotry::UserId).uuid().not_null())
          .col(
            ColumnDef::new(PaymentHisotry::Price)
              .big_integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHisotry::FrTokens)
              .integer()
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHisotry::Status)
              .custom(PaymentStatus::Enum)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHisotry::TransactionId)
              .string_len(100)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHisotry::SessionId)
              .string_len(100)
              .not_null(),
          )
          .col(
            ColumnDef::new(PaymentHisotry::CreatedAt)
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
          .from(PaymentHisotry::Table, PaymentHisotry::FrTokenId)
          .on_delete(ForeignKeyAction::Cascade)
          .to(FrTokenPlan::Table, FrTokenPlan::Id)
          .to_owned(),
      )
      .await?;

    manager
      .create_foreign_key(
        ForeignKey::create()
          .name("fk_payment_histories_user_id")
          .from(PaymentHisotry::Table, PaymentHisotry::UserId)
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
          .table(PaymentHisotry::Table)
          .if_exists()
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_payment_histories_user_id")
          .table(PaymentHisotry::Table)
          .to_owned(),
      )
      .await?;

    manager
      .drop_foreign_key(
        ForeignKey::drop()
          .name("fk_payment_histories_fr_token_id")
          .table(PaymentHisotry::Table)
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
enum PaymentHisotry {
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
