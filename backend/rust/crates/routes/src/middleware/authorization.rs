use actix_web::{
  body::MessageBody,
  dev::{ServiceRequest, ServiceResponse},
  middleware::Next,
  web::Data,
  Error, HttpMessage,
};
use api_common::{
  context::KalamcheContext,
  utils::{find_user_from_jwt, read_auth_token},
};
use utils::error::{KalamcheError, KalamcheErrorType};

pub async fn authorization_middleware(
  req: ServiceRequest,
  next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
  let access_token = read_auth_token(&req.request())?.ok_or(KalamcheError::from(
    KalamcheErrorType::AuthorizationHeaderRequired,
  ))?;

  let context = req
    .app_data::<Data<KalamcheContext>>()
    .ok_or(KalamcheError::from(KalamcheErrorType::SystemErrLogin))?;

  let user = find_user_from_jwt(&access_token, &context).await?;
  req.extensions_mut().insert(user);

  next.call(req).await
}
