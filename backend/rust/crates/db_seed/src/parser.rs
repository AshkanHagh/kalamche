use csv::Reader;

pub async fn read_csv() -> anyhow::Result<()> {
  let mut reader = Reader::from_path("./datasets/lazada-products.csv");

  // // each insertaion hase 20 product withet
  // let chunk = Vec::with_capacity(20);

  Ok(())
}
