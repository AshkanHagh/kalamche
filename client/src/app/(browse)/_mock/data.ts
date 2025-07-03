import { products } from "@/data/mockData"
import { CategoryResponse, relatedCategory } from "../_types"

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
  brands: ["Brand A", "Brand B", "Brand C"],
  priceRange: {
    min: 100,
    max: 500
  },
  relatedCategories: mockCategories
}
