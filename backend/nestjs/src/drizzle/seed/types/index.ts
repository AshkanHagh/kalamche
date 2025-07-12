export interface ProductSpecification {
  name: string;
  value: string;
}

export interface AmazonProduct {
  timestamp: string; // ISO date string, e.g., "2023-08-08 00:00:00.000"
  title: string;
  seller_name: string;
  brand: string;
  description: string;
  initial_price: string | null; // Convert to number or null if applicable
  final_price: string | null; // Convert to number or null if applicable
  currency: string;
  availability: string;
  reviews_count: number;
  categories: string; // JSON parse to string[]
  asin: string;
  buybox_seller: string;
  number_of_sellers: number;
  root_bs_rank: number;
  answered_questions: number;
  domain: string;
  images_count: number;
  url: string;
  video_count: number;
  image_url: string;
  item_weight: string;
  rating: number;
  product_dimensions: string;
  seller_id: string;
  date_first_available: string;
  discount: string;
  model_number: string;
  manufacturer: string;
  department: string;
  plus_content: boolean; // Convert from string "true"/"false" to boolean
  upc: string;
  video: boolean; // Convert from string "true"/"false" to boolean
  top_review: string;
  variations: string; // JSON parse to { asin: string; name: string }[]
  delivery: string; // JSON parse to string[]
  features: string; // JSON parse to string[] or null
  format: string;
  buybox_prices: string; // JSON parse to object or null
  parent_asin: string;
  input_asin: string;
  ingredients: string;
  origin_url: string;
  bought_past_month: string;
  is_available: string;
  root_bs_category: string;
  bs_category: string;
  bs_rank: string;
  badge: string;
  subcategory_rank: string;
  amazon_choice: string;
  images: string; // JSON parse to string[] or null
  product_details: string;
  prices_breakdown: string; // JSON parse to object or null
  country_of_origin: string;
}
