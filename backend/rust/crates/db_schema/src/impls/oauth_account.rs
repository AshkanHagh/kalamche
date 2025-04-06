use entity::oauth_account;
use sea_orm::{prelude::*, ActiveValue::Set};
use utils::error::KalamcheResult;

use crate::{
  connection::Database,
  source::oauth_account::{OAuthAccount, OAuthAccountInsertForm},
};

impl OAuthAccount {
  pub async fn insert(pool: &Database, payload: OAuthAccountInsertForm) -> KalamcheResult<()> {
    let model = oauth_account::ActiveModel {
      oauth_user_id: Set(payload.oauth_user_id),
      user_id: Set(payload.user_id),
    };

    oauth_account::Entity::insert(model).exec(&*pool.0).await?;
    Ok(())
  }

  pub async fn find_by_oauth_id(
    pool: &Database,
    oauth_id: &str,
  ) -> KalamcheResult<Option<OAuthAccount>> {
    let account = oauth_account::Entity::find()
      .filter(oauth_account::Column::OauthUserId.eq(oauth_id))
      .into_model::<OAuthAccount>()
      .one(&*pool.0)
      .await?;

    Ok(account)
  }
}
