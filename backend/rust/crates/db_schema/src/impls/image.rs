use diesel::SelectableHelper;
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;

use crate::{
  connection::{get_conn, DbPool},
  source::image::{Image, ImageInsertForm},
};

impl Image {
  pub async fn insert(pool: &mut DbPool<'_>, form: ImageInsertForm) -> KalamcheResult<Image> {
    use crate::schema::images;
    let conn = &mut get_conn(pool).await?;

    let image = diesel::insert_into(images::table)
      .values(form)
      .returning(Image::as_returning())
      .get_result(conn)
      .await?;

    Ok(image)
  }
}
