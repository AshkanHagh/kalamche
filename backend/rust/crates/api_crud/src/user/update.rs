use actix_web::{
  web::{Data, Json},
  HttpRequest,
};
use api_common::{
  context::KalamcheContext,
  user::{UpdateUser, UpdateUserResponse},
  utils::get_user_from_req,
};
use db_schema::source::{
  image::{EntityType, Image},
  user::{User, UserUpdateForm},
};
use utils::error::KalamcheResult;

pub async fn update_user(
  context: Data<KalamcheContext>,
  Json(payload): Json<UpdateUser>,
  mut req: HttpRequest,
) -> KalamcheResult<Json<UpdateUserResponse>> {
  let user = get_user_from_req(&mut req)?;
  // TODO: if no data used for image remove returning value from Image find methods
  match Image::find_by_entity(&mut context.pool(), user.id, EntityType::User).await? {
    Some(image) => {
      context.image_client.delete_object(image.id).await?;
      Image::delete(&mut context.pool(), image.id).await?;
    }
    None => {}
  };

  let update_form = UserUpdateForm {
    name: Some(payload.name.to_owned()),
    password_hash: None,
  };
  User::update(&mut context.pool(), user.id, update_form).await?;

  Ok(Json(UpdateUserResponse {
    image_id: payload.image_id,
    name: payload.name,
  }))
}
