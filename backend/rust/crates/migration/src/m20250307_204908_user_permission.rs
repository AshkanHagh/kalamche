use sea_orm_migration::{prelude::*, schema::*};

use crate::{m20250307_203232_user::User, m20250307_204900_permission::Permission};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(UserPermission::Table)
          .col(
            ColumnDef::new(UserPermission::Id)
              .uuid()
              .primary_key()
              .not_null(),
          )
          .col(ColumnDef::new(UserPermission::UserId).uuid().not_null())
          .col(
            ColumnDef::new(UserPermission::PermissionId)
              .uuid()
              .not_null(),
          )
          .foreign_key(
            ForeignKey::create()
              .name("fk_permissions_users")
              .from(UserPermission::Table, UserPermission::UserId)
              .on_delete(ForeignKeyAction::NoAction)
              .to(User::Table, User::Id),
          )
          .foreign_key(
            ForeignKey::create()
              .name("fk_users_permissions")
              .from(UserPermission::Table, UserPermission::PermissionId)
              .on_delete(ForeignKeyAction::NoAction)
              .to(Permission::Table, Permission::Id),
          )
          .to_owned(),
      )
      .await
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(
        Table::drop()
          .table(UserPermission::Table)
          .if_exists()
          .restrict()
          .to_owned(),
      )
      .await
  }
}

#[derive(DeriveIden)]
enum UserPermission {
  Table,
  Id,
  UserId,
  PermissionId,
}
