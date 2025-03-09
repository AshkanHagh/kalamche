use actix_web::{
  cookie::{self, Cookie, SameSite},
  get,
  web::{Data, Json, Query},
  HttpResponse,
};
use database::source::{permission::Permission, user::User, user_permissin::UserPermission};
use serde_json::json;
use utils::{
  error::KalamcheResult,
  setting::SETTINGS,
  utils::token::{sign_access_token, sign_refresh_token},
};

use crate::{
  common::oauth::{AuthenticateWithOAuth, GetAuthUrlResponse},
  context::KalamcheContext,
};

const RT_COOKIE_NAME: &str = "refresh_token";
const RT_COOKIE_MAX_AGE: cookie::time::Duration = cookie::time::Duration::days(7);

#[get("/oauth")]
pub async fn create_auth_url(
  context: Data<KalamcheContext>,
) -> KalamcheResult<Json<GetAuthUrlResponse>> {
  let url = context.oauth.create_auth_url();

  Ok(Json(GetAuthUrlResponse { url }))
}

#[get("/oauth/callback1")]
pub async fn authenticate_with_oauth(
  context: Data<KalamcheContext>,
  Query(query): Query<AuthenticateWithOAuth>,
) -> KalamcheResult<HttpResponse> {
  log::info!("req reached");
  let oauth_user = context.oauth.authenticate(query.code).await?;
  log::info!("oauth passed");

  let mut existing_user = User::find_user_by_email(context.pool(), &oauth_user.email).await?;

  if existing_user.is_none() {
    let user = User::insert_by_oauth_detail(context.pool(), oauth_user).await?;
    let default_permissions = Permission::find_default_permission(context.pool()).await?;

    UserPermission::insert_with_default_permission(context.pool(), user.id, default_permissions)
      .await?;

    existing_user = Some(user);
  }

  let user = existing_user.unwrap();
  let user_permissions = UserPermission::find_user_permissions(context.pool(), user.id).await?;

  let (user_id, permission) = (user.id, user_permissions.clone());
  let tokens = tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
    let access_token = sign_access_token(SETTINGS.get_jwt(), user_id, permission)?;
    let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
    Ok((access_token, refresh_token))
  })
  .await??;

  let user_record = User::into_record(user, user_permissions);
  context
    .cache
    .set(
      format!("user:{}", user_record.id).as_ref(),
      &user_record,
      Some(60 * 60 * 24),
    )
    .await?;

  let cookie = config_cookie(&tokens.1, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(HttpResponse::Created().cookie(cookie).json(json!({
    "success": true,
    "accessToken": tokens.0,
    "user": user_record,
  })))
}

fn config_cookie<'a>(
  value: &'a str,
  name: &'a str,
  duration: cookie::time::Duration,
) -> Cookie<'a> {
  let mut cookie = Cookie::new(name, value);
  cookie.set_path("/");
  cookie.set_http_only(true);
  cookie.set_same_site(SameSite::Lax);
  cookie.set_max_age(duration);
  cookie.set_secure(false);

  cookie
}
