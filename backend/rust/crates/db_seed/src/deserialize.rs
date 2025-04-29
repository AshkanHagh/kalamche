use serde::Deserialize;

use crate::structs::ProductSpecification;

pub fn deserialize_json_vec_string<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
  D: serde::Deserializer<'de>,
{
  let s = String::deserialize(deserializer)?;
  serde_json::from_str(&s).map_err(serde::de::Error::custom)
}

pub fn deserialize_json_vec_specification<'de, D>(
  deserializer: D,
) -> Result<Vec<ProductSpecification>, D::Error>
where
  D: serde::Deserializer<'de>,
{
  let s = String::deserialize(deserializer)?;
  serde_json::from_str(&s).map_err(serde::de::Error::custom)
}
