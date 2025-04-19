use actix_web::{get, web::Data, HttpRequest, HttpResponse};
use api_common::{
  context::KalamcheContext,
  user::RefreshTokenResponse,
  utils::{build_auth_cookie_jar, refresh_tokens, set_cookie, REFRESH_COOKIE_NAME},
};
use db_schema::source::{login_token::LoginToken, user::User};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{hash::verify_passwrod, token::verify_refresh_token},
};

#[get("/token/refresh")]
pub async fn refresh_token(
  context: Data<KalamcheContext>,
  req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let refresh_token = req
    .cookie(REFRESH_COOKIE_NAME)
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  let token_claims = verify_refresh_token(SETTINGS.get_jwt(), refresh_token.value())?;
  let user = User::find_by_id(&mut context.pool(), token_claims.sub)
    .await?
    .ok_or(KalamcheErrorType::NotLoggedIn)?;

  let login_token = LoginToken::find_by_user_id(&mut context.pool(), user.id).await?;

  if !verify_passwrod(refresh_token.value(), &login_token.token_hash)? {
    return Err(KalamcheError::from(KalamcheErrorType::NotLoggedIn));
  }

  let (access_token, refresh_token) = refresh_tokens(&context, &req, user.id).await?;
  let jar = build_auth_cookie_jar(&access_token, &refresh_token);
  let response = HttpResponse::Created().json(RefreshTokenResponse {
    success: true,
    access_token,
  });

  set_cookie(jar, response)
}
