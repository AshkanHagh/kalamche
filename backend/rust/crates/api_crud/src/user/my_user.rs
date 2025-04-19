use actix_web::{
  get,
  web::{Data, Json},
  HttpRequest,
};
use api_common::{
  context::KalamcheContext,
  user::{MyUserInfo, MyUserResponse},
  utils::get_user_from_req,
};
use db_view::structs::UserView;
use utils::error::KalamcheResult;

// NOTE: this function can provider other user infos that not related to user
// for example site related things.
#[get("/me")]
pub async fn get_my_user(
  context: Data<KalamcheContext>,
  mut req: HttpRequest,
) -> KalamcheResult<Json<MyUserResponse>> {
  let user = get_user_from_req(&mut req)?;
  let user_view = UserView::read(&mut context.pool(), user.id).await?;

  let my_user = MyUserInfo { user_view };
  Ok(Json(MyUserResponse {
    success: true,
    my_user,
  }))
}
