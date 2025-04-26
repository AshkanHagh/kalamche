use actix_web::{
  web::{Data, Path},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  image::{GetImage, GetUploadProgress, GetUploadProgressResponse},
  utils::get_user_from_req,
};
use async_stream::stream;
use bytes::Bytes;
use db_schema::source::image::Image;
use utils::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

use super::utils::generate_sha256_hash_by_image_name;

pub async fn get_image(
  context: Data<KalamcheContext>,
  path: Path<GetImage>,
) -> KalamcheResult<HttpResponse> {
  let image = Image::find_by_hash(&mut context.pool(), &path.image_hash).await?;

  let image_object = context.image_client.get_object(image.id).await?;
  // use another error type
  let bytes = image_object
    .body
    .collect()
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

  Ok(
    HttpResponse::Ok()
      .content_type("image/jpeg")
      .body(bytes.to_vec()),
  )
}

pub async fn get_upload_progress(
  context: Data<KalamcheContext>,
  path: Path<GetUploadProgress>,
  mut req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let user = get_user_from_req(&mut req)?;
  let image_hash = generate_sha256_hash_by_image_name(&format!("{}/{}", user.id, path.image_name));

  let (total_bytes, mut rx) = {
    let progress_map = context.upload_progress.read().await;
    let progress = progress_map
      .get(&image_hash)
      .ok_or(KalamcheErrorType::NotFound)?;

    (progress.total_bytes, progress.sender.subscribe())
  };

  let body = stream! {
    while let Ok(bytes) = rx.recv().await {
      let response = serde_json::to_string(&GetUploadProgressResponse {
        total_bytes,
        uploaded_bytes: bytes,
      })?;

      yield Ok::<_, actix_web::Error>(Bytes::from(format!("data: {}\n\n", response)));

      if bytes >= total_bytes {
        // Remove when upload completes successfully
        let mut progress_map = context.upload_progress.write().await;
        progress_map.remove(&image_hash);
        break;
      }
    }
    // Remove on stream end (client disconnect or error) to prevent stale entries
    let mut progress_map = context.upload_progress.write().await;
    progress_map.remove(&image_hash);
  };

  Ok(
    HttpResponse::Ok()
      .content_type("text/event-stream")
      .insert_header(("Cache-Control", "no-cache"))
      .insert_header(("Connection", "keep-alive"))
      .streaming(body),
  )
}
