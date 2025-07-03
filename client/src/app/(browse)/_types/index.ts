import { Product } from "@/types"

export type relatedCategory = {
  id: string
  name: string
}

export type ProductSorts = "newest" | "cheapest" | "expensive" | "popular"

export type PriceRange = {
  min: number
  max: number
}

export type CategoryResponse = {
  products: Product[]
  brands: Checkbox[]
  relatedCategories: relatedCategory[]
  priceRange: PriceRange
  hasNext: boolean
}

export type Checkbox = {
  label: string
  value: string
}
