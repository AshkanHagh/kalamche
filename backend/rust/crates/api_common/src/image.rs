use db_schema::source::image::EntityType;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct UploadImageResponse {
  pub success: bool,
  pub image_hashes: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct GetUploadProgress {
  pub image_name: String,
}

#[derive(Debug, Serialize)]
pub struct GetUploadProgressResponse {
  pub total_bytes: u64,
  pub uploaded_bytes: u64,
}

#[derive(Debug, Deserialize)]
pub struct UploadImage {
  pub entity_type: EntityType,
  pub entity_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct GetImage {
  pub image_hash: String,
}
