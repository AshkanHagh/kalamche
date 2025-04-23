import { Product } from "@/types"

export type Seller = {
  name: string
  rating: number
}

export type PriceHistory = {
  month: string
  price: number
}

export type Specification = {
  label: string
  value: string
}

export type OtherSeller = {
  id: string
  name: string
  logo: string
  rating: number
  price: number
  description: string
}

export type ProductDetailsType = {
  id: string
  name: string
  price: number
  description: string
  likes: number
  views: number
  images: string[]
  seller: Seller
  priceHistory: PriceHistory[]
  specifications: Specification[]
  otherSellers: OtherSeller[]
  relatedProducts: Product[]
}
