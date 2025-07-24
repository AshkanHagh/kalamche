export type SearchResponse = {
  products: {
    id: string;
    name: string;
    price: number;
    sellerName: string;
    imageUrl: string;
  }[];
  brands?: {
    key: string;
    value: string;
  }[];
  priceRange?: {
    min: number;
    max: number;
  };
  hasNext: boolean;
};
