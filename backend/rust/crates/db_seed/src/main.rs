use std::path::PathBuf;

use parser::read_csv;

pub mod deserialize;
pub mod parser;
pub mod structs;

// TODO: move the datasets to s3 bucket
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let path = PathBuf::from("crates/db_seed/datasets/lazada-products.csv");
  let _ = read_csv(path.to_str().unwrap()).await?;

  Ok(())
}
