use actix_multipart::Field;
use api_common::context::KalamcheContext;
use aws_sdk_s3::{primitives::ByteStream, types::CompletedPart};
use futures::TryStreamExt;
use sha2::Digest;
use tokio::{
  fs::File,
  io::{AsyncReadExt, AsyncWriteExt},
  sync::broadcast,
};
use utils::{
  error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  utils::temp_file::TempFile,
};
use uuid::Uuid;

pub fn generate_sha256_hash_by_image_name(image_name: &str) -> String {
  let mut hasher = sha2::Sha256::new();
  hasher.update(image_name.as_bytes());
  format!("{:x}", hasher.finalize())
}

pub async fn create_temp_file_with_size(
  field: &mut Field,
  image_id: Uuid,
) -> KalamcheResult<(TempFile, u64)> {
  let temp_file_path = format!("/tmp/{}", image_id);
  let temp_file = TempFile::new(temp_file_path).await?;

  let mut file = temp_file
    .create_file()
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;
  while let Ok(Some(bytes)) = field.try_next().await {
    file
      .write_all(&bytes)
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;
  }

  file
    .flush()
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;
  drop(file);

  let image_total_bytes = temp_file
    .get_size()
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

  Ok((temp_file, image_total_bytes))
}

pub async fn upload_part(
  context: &KalamcheContext,
  file: &mut File,
  buffer_size: usize,
  uploaded_bytes: &mut u64,
  image_id: Uuid,
  multipart_upload_id: &str,
  multipart_part_number: i32,
  parts: &mut Vec<CompletedPart>,
  tx: &broadcast::Sender<u64>,
) -> KalamcheResult<()> {
  let mut buffer = vec![0u8; buffer_size];
  file
    .read_exact(&mut buffer)
    .await
    .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

  let s3_stream = ByteStream::from(buffer);
  let upload_part = context
    .image_client
    .upload_part(
      image_id,
      multipart_upload_id,
      multipart_part_number,
      s3_stream,
    )
    .await?;

  parts.push(
    CompletedPart::builder()
      .e_tag(upload_part.e_tag().unwrap())
      .part_number(multipart_part_number)
      .build(),
  );

  *uploaded_bytes += buffer_size as u64;
  let _ = tx.send(*uploaded_bytes);
  Ok(())
}
