use tokio::io::AsyncWriteExt;

use crate::structs::Categories;

pub async fn write_string(categories: Categories) -> anyhow::Result<()> {
  let category_string = serde_json::to_string(&categories)?;
  let mut file = tokio::fs::File::create("crates/db_seed/datasets/categories.json").await?;
  file.write_all(category_string.as_bytes()).await?;

  Ok(())
}
