export interface ProductSpecification {
  name: string;
  value: string;
}

export interface LazadaProduct {
  url: string;
  title: string;
  rating: number | null;
  reviews: number;
  initial_price: string | null;
  final_price: string;
  currency: string;
  image: string[];
  seller_name: string;
  // stringified
  breadcrumb: string;
  // stringified
  product_specifications: string;
  product_description: string;
  seller_ratings: number | null;
  seller_ship_on_time: string | null;
  seller_chat_response: string | null;
  sku: string;
  mpn: string;
  colors: string | null;
  variations: string;
  color: string | null;
  returns_and_warranty: string;
  is_super_seller: boolean;
  promotions: string;
  brand: string;
  product_variation: string;
  lazmall: boolean;
  domain: string;
  number_sold: number;
  gmv: number | null;
}
