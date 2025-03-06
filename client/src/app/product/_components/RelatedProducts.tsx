import ProductCard from "@/components/product/ProductCard"
import type { ProductCardType } from "@/types"

type RelatedProductsProps = {
  relatedProducts: ProductCardType[]
}

const RelatedProducts = ({ relatedProducts }: RelatedProductsProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Related Products
      </h2>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard
            className="max-w-[auto]"
            key={relatedProduct.id}
            product={relatedProduct}
          />
        ))}
      </div>
    </div>
  )
}
export default RelatedProducts
