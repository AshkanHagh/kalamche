// use actix_web::{
//   body::MessageBody,
//   dev::{ServiceRequest, ServiceResponse},
//   middleware::Next,
//   Error,
// };
// use api_common::utils::{read_auth_token, RT_COOKIE_NAME};
// use utils::error::KalamcheErrorType;

// pub async fn authorization_middleware(
//   req: ServiceRequest,
//   next: Next<impl MessageBody>,
// ) -> Result<ServiceResponse<impl MessageBody>, Error> {
//   let access_token = read_auth_token(&req.request())?;
//   next.call(req).await
// }
