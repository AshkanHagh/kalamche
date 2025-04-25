use actix_multipart::Multipart;
use actix_web::{
  web::{Data, Path},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  image::{GetUploadProgress, GetUploadProgressResponse, UploadImage, UploadImageResponse},
  utils::get_user_from_req,
};
use async_stream::stream;
use aws_sdk_s3::{
  primitives::ByteStream,
  types::{CompletedMultipartUpload, CompletedPart},
};
use bytes::Bytes;
use db_schema::source::image::{Image, ImageInsertForm};
use futures::TryStreamExt;
use tokio::sync::broadcast;
use utils::{
  error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  image::UploadProgress,
  utils::temp_file::TempFile,
};
use uuid::Uuid;

use crate::images::utils::{create_temp_file_with_size, upload_part};

use super::{
  utils::generate_sha256_hash_by_image_name, ALLOW_IMAGE_CONTENT_TYPE, MAX_IMAGE_SIZE,
  MIN_FILE_PART_SIZE,
};

pub async fn upload_image(
  context: Data<KalamcheContext>,
  path: Path<UploadImage>,
  mut payload: Multipart,
  mut req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let user = get_user_from_req(&mut req)?;
  let mut image_count = 0;
  let mut image_hashes: Vec<String> = Vec::with_capacity(5);

  while let Ok(Some(mut field)) = payload.try_next().await {
    if image_count >= 5 {
      return Err(KalamcheError::from(KalamcheErrorType::TooManyItems));
    }

    let image_content_type = field
      .content_type()
      .ok_or(KalamcheErrorType::InvalidImageUpload)?
      .to_string();
    if !ALLOW_IMAGE_CONTENT_TYPE.contains(&image_content_type.as_str()) {
      return Err(KalamcheError::from(KalamcheErrorType::InvalidImageMimeType));
    }

    let image_insert_form = ImageInsertForm {
      user_id: user.id,
      content_type: image_content_type.to_owned(),
      entity_id: path.entity_id,
      entity_type: path.entity_type.clone(),
    };
    // using image id to create temp files and other to avoid doplication
    let created_image = Image::insert(&mut context.pool(), image_insert_form).await?;

    let (temp_file, total_bytes) = create_temp_file_with_size(&mut field, created_image.id).await?;
    if total_bytes > MAX_IMAGE_SIZE as u64 {
      // reanme error type
      return Err(KalamcheError::from(KalamcheErrorType::TooManyItems));
    }

    let (tx, _rx) = broadcast::channel(100);
    {
      let content_disposition = field
        .content_disposition()
        .ok_or(KalamcheErrorType::InvalidImageUpload)?;
      let filename = content_disposition
        .get_filename()
        .ok_or(KalamcheErrorType::InvalidImageUpload)?;

      let image_hash = generate_sha256_hash_by_image_name(&format!("{}/{}", user.id, filename));
      image_hashes.push(image_hash.to_owned());

      let mut progress_map = context.upload_progress.lock().await;
      let upload_progress = UploadProgress {
        total_bytes,
        sender: tx.clone(),
      };

      // upload progress key created by user id and image name
      progress_map.insert(image_hash, upload_progress);
    }

    if total_bytes < MIN_FILE_PART_SIZE as u64 {
      let file_data = temp_file
        .read_to_vec()
        .await
        .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

      let _ = tx.send(total_bytes / 2);

      let s3_stream = ByteStream::from(file_data);
      context
        .image_client
        .put_object(created_image.id, &image_content_type, s3_stream)
        .await?;

      let _ = tx.send(total_bytes);
    } else {
      let (uploaded_parts, upload_id) = do_multipart_upload(
        temp_file,
        &context,
        created_image.id,
        total_bytes,
        &image_content_type,
        &tx,
      )
      .await?;

      let completed_upload = CompletedMultipartUpload::builder()
        .set_parts(Some(uploaded_parts))
        .build();
      context
        .image_client
        .complete_multipart_upload(created_image.id, completed_upload, &upload_id)
        .await?;
    }

    image_count += 1;
  }

  Ok(HttpResponse::Ok().json(UploadImageResponse {
    success: true,
    image_hashes,
  }))
}

pub async fn get_upload_progress(
  context: Data<KalamcheContext>,
  path: Path<GetUploadProgress>,
  mut req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  let user = get_user_from_req(&mut req)?;
  let image_hash = generate_sha256_hash_by_image_name(&format!("{}/{}", user.id, path.image_name));

  let (total_bytes, mut rx) = {
    let progress_map = context.upload_progress.lock().await;
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
        let mut progress_map = context.upload_progress.lock().await;
        progress_map.remove(&image_hash);
        break;
      }
    }
    // Remove on stream end (client disconnect or error) to prevent stale entries
    let mut progress_map = context.upload_progress.lock().await;
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

async fn do_multipart_upload(
  temp_file: TempFile,
  context: &KalamcheContext,
  image_id: Uuid,
  total_bytes: u64,
  content_type: &str,
  tx: &broadcast::Sender<u64>,
) -> KalamcheResult<(Vec<CompletedPart>, String)> {
  let complete_parts = (total_bytes / MIN_FILE_PART_SIZE as u64) as usize;
  let remainder_size = (total_bytes % MIN_FILE_PART_SIZE as u64) as usize;

  let multipart_upload_id = context
    .image_client
    .create_multipart_upload(image_id, content_type)
    .await?;

  let mut parts = Vec::new();
  let mut part_number = 1;
  let mut uploaded_bytes: u64 = 0;
  let mut file = temp_file
    .open_file()
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

  for _ in 0..complete_parts {
    upload_part(
      context,
      &mut file,
      MIN_FILE_PART_SIZE,
      &mut uploaded_bytes,
      image_id,
      &multipart_upload_id,
      part_number,
      &mut parts,
      tx,
    )
    .await?;

    part_number += 1;
  }

  if remainder_size > 0 {
    upload_part(
      context,
      &mut file,
      remainder_size,
      &mut uploaded_bytes,
      image_id,
      &multipart_upload_id,
      part_number,
      &mut parts,
      tx,
    )
    .await?;
  }

  Ok((parts, multipart_upload_id))
}
