use actix_web::{get, web::Data, HttpRequest, HttpResponse};
use api_common::{
  context::KalamcheContext,
  user::RefreshTokenResponse,
  utils::{build_cookie, get_user_ip, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME},
};
use database::source::{
  login_token::{LoginToken, LoginTokenInsertForm},
  user::User,
  user_permissin::UserPermission,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    hash::verify_passwrod,
    token::{sign_access_token, sign_refresh_token, verify_refresh_token},
  },
};

#[get("/token/refresh")]
pub async fn refresh_token(
  context: Data<KalamcheContext>,
  req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let refresh_token = req
    .cookie(RT_COOKIE_NAME)
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  let token_claims = verify_refresh_token(SETTINGS.get_jwt(), refresh_token.value())?;
  let user = User::find_by_id(context.pool(), token_claims.sub)
    .await?
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  let login_token = LoginToken::find_by_user_id(context.pool(), user.id).await?;

  if !verify_passwrod(refresh_token.value(), &login_token.token_hash)? {
    return Err(KalamcheError::from(KalamcheErrorType::NotLoggedIn));
  }

  let user_permissoins = UserPermission::find_user_permissions(context.pool(), user.id).await?;

  let (user_id, permission) = (user.id, user_permissoins.clone());
  let (access_token, refresh_token) =
    tokio::task::spawn_blocking(move || -> KalamcheResult<(String, String)> {
      let access_token = sign_access_token(SETTINGS.get_jwt(), user_id, permission)?;
      let refresh_token = sign_refresh_token(SETTINGS.get_jwt(), user_id)?;
      Ok((access_token, refresh_token))
    })
    .await??;

  LoginToken::insert(
    context.pool(),
    LoginTokenInsertForm {
      user_id: user.id,
      ip: get_user_ip(&req),
      token_hash: refresh_token.to_owned(),
    },
  )
  .await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(
    HttpResponse::Created()
      .cookie(cookie)
      .json(RefreshTokenResponse {
        success: true,
        access_token,
      }),
  )
}
