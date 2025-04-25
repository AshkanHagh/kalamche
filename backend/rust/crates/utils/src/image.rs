use tokio::sync::broadcast;
use uuid::Uuid;

pub struct UploadProgress {
  pub total_bytes: u64,
  pub sender: broadcast::Sender<u64>,
}

use crate::{
  error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  settings::{structs::ImageConfig, SETTINGS},
};
use aws_sdk_s3::{
  config::Credentials, operation::upload_part::UploadPartOutput, primitives::ByteStream,
  types::CompletedMultipartUpload, Client,
};

pub struct S3ImageClient {
  pub(super) bucket: Client,
}

impl S3ImageClient {
  pub fn new(config: &ImageConfig) -> Self {
    let credentials = Credentials::new(&config.access_key, &config.secret_key, None, None, "s3");
    let config = aws_sdk_s3::Config::builder()
      .region(aws_sdk_s3::config::Region::new(""))
      .credentials_provider(credentials)
      .endpoint_url(&config.endpoint)
      .force_path_style(config.allow_path_syle)
      .behavior_version_latest()
      .build();

    Self {
      bucket: Client::from_conf(config),
    }
  }

  pub async fn put_object(
    &self,
    key: Uuid,
    content_type: &str,
    bytes: ByteStream,
  ) -> KalamcheResult<()> {
    self
      .bucket
      .put_object()
      .bucket(&SETTINGS.get_image().bucket_name)
      .key(key)
      .content_type(content_type)
      .body(bytes)
      .send()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

    Ok(())
  }

  pub async fn create_multipart_upload(
    &self,
    key: Uuid,
    content_type: &str,
  ) -> KalamcheResult<String> {
    let multipart_upload = self
      .bucket
      .create_multipart_upload()
      .bucket(&SETTINGS.get_image().bucket_name)
      .content_type(content_type)
      .key(key)
      .send()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

    let upload_id = multipart_upload
      .upload_id()
      .ok_or(KalamcheErrorType::InvalidImageUpload)?
      .to_string();

    Ok(upload_id)
  }

  pub async fn upload_part(
    &self,
    key: Uuid,
    upload_id: &str,
    part_number: i32,
    bytes: ByteStream,
  ) -> KalamcheResult<UploadPartOutput> {
    let upload_part = self
      .bucket
      .upload_part()
      .bucket(&SETTINGS.get_image().bucket_name)
      .key(key)
      .upload_id(upload_id)
      .part_number(part_number)
      .body(bytes)
      .send()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

    Ok(upload_part)
  }

  pub async fn complete_multipart_upload(
    &self,
    key: Uuid,
    completed_upload: CompletedMultipartUpload,
    upload_id: &str,
  ) -> KalamcheResult<()> {
    self
      .bucket
      .complete_multipart_upload()
      .bucket(&SETTINGS.get_image().bucket_name)
      .key(key)
      .multipart_upload(completed_upload)
      .upload_id(upload_id)
      .send()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidImageUpload)?;

    Ok(())
  }
}
