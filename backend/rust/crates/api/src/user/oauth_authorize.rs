use actix_web::{
  get,
  web::{Data, Json, Query},
};
use api_common::{
  context::KalamcheContext,
  oauth_provider::{GetAuthorizeUrl, GetAuthrizeUrlResponse},
};
use utils::error::KalamcheResult;

#[get("/oauth")]
pub async fn get_authorize_url(
  context: Data<KalamcheContext>,
  Query(query): Query<GetAuthorizeUrl>,
) -> KalamcheResult<Json<GetAuthrizeUrlResponse>> {
  let url = context.oauth().get_authorize_url(&query.provider)?;

  Ok(Json(GetAuthrizeUrlResponse { success: true, url }))
}
