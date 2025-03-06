import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product/ProductCard"
import type { ProductCardType } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

type ProductCarouselProps = {
  title: string
  description: string
  products: ProductCardType[]
}

const ProductCarousel = ({
  title,
  description,
  products
}: ProductCarouselProps) => {
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Link
          href="#"
          className="text-sm font-medium text-primary hover:underline"
        >
          More...
        </Link>
      </div>
      <div className="relative mt-6">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-background shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
        <div
          className="flex space-x-4 overflow-x-auto pb-4 pt-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      </div>
    </section>
  )
}
export default ProductCarousel
