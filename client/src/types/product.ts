export type ProductCardType = {
  id: number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  seller: string
  image: string
}
export type Product = {
  id: number
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
  relatedProducts: RelatedProduct[]
}

export type Seller = {
  name: string
  rating: number
}

export type PriceHistory = {
  date: string
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

export type RelatedProduct = {
  name: string
  price: number
  image: string
}
