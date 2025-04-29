use std::fs::File;

use csv::{Reader, ReaderBuilder};
use db_schema::{
  connection::{build_pool, DbPool},
  source::{
    product::{Product, ProductInsertForm, ProductSpecification, ProductStatus},
    shop::Shop,
  },
};

use crate::structs::{ImportStats, LazadaProduct};

pub async fn read_csv(path: &str) -> anyhow::Result<ImportStats> {
  let pool = build_pool().unwrap();
  let mut pool = DbPool::Pool(&pool);

  let shops = Shop::find_shops(&mut pool).await?;

  let reader = create_csv_reader(path).await?;

  let product_forms = transform_csv_to_product_forms(reader, &shops)?;

  let stats = batch_insert_products(&mut pool, product_forms, 50).await?;

  Ok(stats)
}

async fn create_csv_reader(path: &str) -> anyhow::Result<Reader<File>> {
  let file = File::open(path)?;
  let reader = ReaderBuilder::new()
    .has_headers(true)
    .flexible(true)
    .from_reader(file);

  Ok(reader)
}

fn transform_csv_to_product_forms(
  mut reader: Reader<File>,
  shops: &[Shop],
) -> anyhow::Result<Vec<ProductInsertForm>> {
  let mut product_forms = Vec::new();

  for product in reader.deserialize::<LazadaProduct>() {
    let product = product?;

    let product_specifications: Vec<Option<diesel_json::Json<ProductSpecification>>> = product
      .product_specifications
      .into_iter()
      .map(|s| {
        Some(diesel_json::Json(ProductSpecification {
          key: s.name,
          value: s.value,
        }))
      })
      .collect::<Vec<Option<diesel_json::Json<ProductSpecification>>>>();

    // we want each shop have the same product
    for shop in shops.iter() {
      let product_insert_form = ProductInsertForm {
        shop_id: shop.id,
        categories: product
          .breadcrumb
          .clone()
          .into_iter()
          .map(|i| Some(i))
          .collect(),
        description: product.product_description.clone(),
        name: product.title.clone(),
        status: ProductStatus::Public,
        price: product.final_price.parse()?,
        specifications: product_specifications.clone(),
        website: product.domain.clone(),
        likes: 0,
        views: 0,
      };

      product_forms.push(product_insert_form);
    }
  }

  Ok(product_forms)
}

async fn batch_insert_products(
  pool: &mut DbPool<'_>,
  product_forms: Vec<ProductInsertForm>,
  batch_size: usize,
) -> anyhow::Result<ImportStats> {
  let start_time = std::time::Instant::now();
  let total_products = product_forms.len();
  let mut inserted = 0;

  for chunk in product_forms.chunks(batch_size) {
    let _ = Product::insert_many(pool, chunk.to_vec()).await?;
    inserted += chunk.len();
    println!(
      "Progress: {}/{} products inserted",
      inserted, total_products
    );
  }

  Ok(ImportStats {
    total_products,
    total_inserts: inserted,
    elapsed_time: start_time.elapsed(),
  })
}
