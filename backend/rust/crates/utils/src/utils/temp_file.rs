use tokio::fs::File;

use crate::error::KalamcheResult;

pub struct TempFile {
  path: String,
}

impl TempFile {
  pub async fn new(path: String) -> KalamcheResult<Self> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
      tokio::fs::create_dir_all(parent).await?;
    }

    Ok(Self { path })
  }

  pub async fn create_file(&self) -> std::io::Result<File> {
    tokio::fs::File::create(&self.path).await
  }

  pub async fn open_file(&self) -> std::io::Result<File> {
    tokio::fs::File::open(&self.path).await
  }

  pub async fn get_size(&self) -> std::io::Result<u64> {
    let metadata = tokio::fs::metadata(&self.path).await?;
    Ok(metadata.len())
  }

  pub async fn read_to_vec(&self) -> std::io::Result<Vec<u8>> {
    tokio::fs::read(&self.path).await
  }
}

impl Drop for TempFile {
  fn drop(&mut self) {
    let path = self.path.clone();
    tokio::spawn(async move {
      let _ = tokio::fs::remove_file(&path).await;
    });
  }
}
