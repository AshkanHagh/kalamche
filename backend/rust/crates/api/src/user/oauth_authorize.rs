use actix_web::{
  get,
  web::{Data, Query},
  HttpResponse,
};
use api_common::{context::KalamcheContext, oauth_provider::GetAuthorizeUrl};
use serde_json::json;
use utils::error::KalamcheResult;

#[get("/oauth")]
pub async fn get_authorize_url(
  context: Data<KalamcheContext>,
  Query(query): Query<GetAuthorizeUrl>,
) -> KalamcheResult<HttpResponse> {
  let url = context.oauth().get_authorize_url(&query.provider)?;

  Ok(HttpResponse::Ok().json(json!({
    "success": true,
    "url": url,
  })))
}
