use actix_multipart::Multipart;
use actix_web::{
  web::{Data, Path},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  image::{UploadImage, UploadImageResponse},
  utils::get_user_from_req,
};
use aws_sdk_s3::{
  primitives::ByteStream,
  types::{CompletedMultipartUpload, CompletedPart},
};
use db_schema::source::{
  image::{EntityType, Image, ImageInsertForm},
  user::User,
};
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

// TODO: upload_progress will not clean up if user dose not req to upload progress route
// TODO: on any stop condition(cancel req, error, etc) after uploading some mulitpart part, uploaded parts
// are not geting remove from s3 bucket
// TODO: sha 256 hash of filename and user id is not unique
// if user upload same image more then once it throw error
pub async fn upload_image(
  context: Data<KalamcheContext>,
  path: Path<UploadImage>,
  mut payload: Multipart,
  mut req: HttpRequest,
) -> KalamcheResult<HttpResponse> {
  check_entity_id_exists(context.clone(), path.entity_id, &path.entity_type).await?;
  let user = get_user_from_req(&mut req)?;
  let mut image_count = 0;
  let mut image_ids: Vec<Uuid> = Vec::with_capacity(5);

  while let Ok(Some(mut field)) = payload.try_next().await {
    image_count += 1;
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

    let filename = field
      .content_disposition()
      .ok_or(KalamcheErrorType::InvalidImageUpload)?
      .get_filename()
      .ok_or(KalamcheErrorType::InvalidImageUpload)?;

    let image_hash = generate_sha256_hash_by_image_name(&format!("{}/{}", user.id, filename));

    let image_insert_form = ImageInsertForm {
      hash: Some(image_hash.to_owned()),
      content_type: image_content_type.to_owned(),
      entity_id: path.entity_id,
      entity_type: path.entity_type.clone(),
    };
    // using image id to create temp files and other to avoid duplication
    let created_image = Image::insert(&mut context.pool(), image_insert_form).await?;
    image_ids.push(created_image.id);

    let (temp_file, total_bytes) = create_temp_file_with_size(&mut field, created_image.id).await?;
    if total_bytes > MAX_IMAGE_SIZE as u64 {
      // FIX: reanme error type
      return Err(KalamcheError::from(KalamcheErrorType::TooManyItems));
    }

    let (tx, _rx) = broadcast::channel(100);
    {
      let mut progress_map = context.upload_progress.write().await;
      progress_map.insert(
        image_hash,
        UploadProgress {
          total_bytes,
          sender: tx.clone(),
        },
      );
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
  }

  Ok(HttpResponse::Ok().json(UploadImageResponse {
    success: true,
    image_ids,
  }))
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

async fn check_entity_id_exists(
  context: Data<KalamcheContext>,
  entity_id: Uuid,
  entity_type: &EntityType,
) -> KalamcheResult<()> {
  match entity_type {
    EntityType::Product => todo!(),
    EntityType::User => {
      User::find_by_id(&mut context.pool(), entity_id)
        .await?
        .ok_or(KalamcheErrorType::NotFound)?;
    }
    EntityType::Shop => todo!(),
  }

  Ok(())
}
