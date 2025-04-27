use diesel::{ExpressionMethods, OptionalExtension, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use utils::error::KalamcheResult;
use uuid::Uuid;

use crate::{
  connection::{get_conn, DbPool},
  source::image::{EntityType, Image, ImageInsertForm},
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

  pub async fn find_by_entity(
    pool: &mut DbPool<'_>,
    entity_id: Uuid,
    entity_type: EntityType,
  ) -> KalamcheResult<Option<Image>> {
    use crate::schema::images;
    let conn = &mut get_conn(pool).await?;

    let image = images::table
      .filter(images::id.eq(entity_id))
      .filter(images::entity_type.eq(entity_type))
      .order(images::created_at.asc())
      .select(Image::as_select())
      .first(conn)
      .await
      .optional()?;

    Ok(image)
  }

  pub async fn find_by_hash(pool: &mut DbPool<'_>, hash: &str) -> KalamcheResult<Image> {
    use crate::schema::images;
    let conn = &mut get_conn(pool).await?;

    let image = images::table
      .filter(images::hash.eq(hash))
      .select(Image::as_select())
      .first(conn)
      .await?;

    Ok(image)
  }

  pub async fn find_by_id(pool: &mut DbPool<'_>, image_id: Uuid) -> KalamcheResult<Image> {
    use crate::schema::images;
    let conn = &mut get_conn(pool).await?;

    let image = images::table
      .filter(images::id.eq(image_id))
      .select(Image::as_select())
      .first(conn)
      .await?;

    Ok(image)
  }

  pub async fn delete(pool: &mut DbPool<'_>, image_id: Uuid) -> KalamcheResult<()> {
    use crate::schema::images;
    let conn = &mut get_conn(pool).await?;

    diesel::delete(images::table)
      .filter(images::id.eq(image_id))
      .execute(conn)
      .await?;

    Ok(())
  }
}
