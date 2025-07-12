import { products } from "@/data/mockData"
import { CategoryResponse, relatedCategory, SearchResponse } from "../_types"

export const mockCategories: relatedCategory[] = [
  {
    id: "1",
    name: "Laptops"
  },
  {
    id: "2",
    name: "Smartphones"
  },
  {
    id: "3",
    name: "Headphones"
  },
  {
    id: "4",
    name: "Cameras"
  },
  {
    id: "5",
    name: "Smartwatches"
  },
  {
    id: "6",
    name: "Televisions"
  },
  {
    id: "7",
    name: "Speakers"
  },
  {
    id: "8",
    name: "Gaming"
  },
  {
    id: "9",
    name: "Printers"
  },
  {
    id: "10",
    name: "Tablets"
  }
]

export const mockCategoryProducts: CategoryResponse = {
  hasNext: true,
  products: products,
  brands: [
    { label: "Brand A", value: "brand-a" },
    { label: "Brand B", value: "brand-b" },
    { label: "Brand C", value: "brand-c" },
    { label: "Brand D", value: "brand-d" },
    { label: "Brand E", value: "brand-e" },
    { label: "Brand F", value: "brand-f" },
    { label: "Brand G", value: "brand-g" },
    { label: "Brand H", value: "brand-h" },
    { label: "Brand I", value: "brand-i" }
  ],
  priceRange: {
    min: 100,
    max: 500
  },
  relatedCategories: mockCategories
}
export const mockSearchProducts: SearchResponse = {
  hasNext: true,
  products: products,
  brands: [
    { label: "Brand A", value: "brand-a" },
    { label: "Brand B", value: "brand-b" },
    { label: "Brand C", value: "brand-c" },
    { label: "Brand D", value: "brand-d" },
    { label: "Brand E", value: "brand-e" },
    { label: "Brand F", value: "brand-f" },
    { label: "Brand G", value: "brand-g" },
    { label: "Brand H", value: "brand-h" },
    { label: "Brand I", value: "brand-i" }
  ],
  priceRange: {
    min: 6000,
    max: 50000
  },
  relatedCategories: mockCategories
}
