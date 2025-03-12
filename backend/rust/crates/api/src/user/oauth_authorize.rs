use actix_web::{
  get,
  web::{Data, Query},
  HttpResponse,
};
use api_common::{
  context::KalamcheContext, oauth_provider::GetAuthorizeUrl, user::AuthrizeUrlResponse,
};
use utils::error::KalamcheResult;

#[get("/oauth")]
pub async fn get_authorize_url(
  context: Data<KalamcheContext>,
  Query(query): Query<GetAuthorizeUrl>,
) -> KalamcheResult<HttpResponse> {
  let url = context.oauth().get_authorize_url(&query.provider)?;

  Ok(HttpResponse::Ok().json(AuthrizeUrlResponse { success: true, url }))
}
