use actix_web::{
  get,
  web::{Data, Json},
};
use config::error::KalamcheResult;

use crate::{common::user::CreateAuthUrlResponse, context::KalamcheContext};

#[get("/oauth")]
pub async fn create_auth_url(
  context: Data<KalamcheContext>,
) -> KalamcheResult<Json<CreateAuthUrlResponse>> {
  let url = context.adapters.oauth.create_auth_url();
  Ok(Json(CreateAuthUrlResponse { url }))
}
