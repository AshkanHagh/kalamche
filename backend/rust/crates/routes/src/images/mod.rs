pub mod download;
pub mod upload;
pub mod utils;

pub const MAX_IMAGE_PAYLOAD: u8 = 5;
pub const MIN_FILE_PART_SIZE: usize = 5 * 1024 * 1024;
pub const MAX_IMAGE_SIZE: usize = 10 * 1024 * 1024;
pub const ALLOW_IMAGE_CONTENT_TYPE: [&str; 2] = ["image/jpeg", "image/png"];
