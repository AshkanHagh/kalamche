use actix_web::{
  get,
  web::{Data, Json},
};
use utils::error::KalamcheResult;

use crate::{common::user::GetAuthUrlResponse, context::KalamcheContext};

#[get("/oauth")]
pub async fn create_auth_url(
  context: Data<KalamcheContext>,
) -> KalamcheResult<Json<GetAuthUrlResponse>> {
  let url = context.oauth.create_auth_url();

  Ok(Json(GetAuthUrlResponse { url }))
}
