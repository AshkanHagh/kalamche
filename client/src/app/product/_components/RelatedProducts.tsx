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
      <div className="grid gap-12 justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard
            className="max-w-[318px] sm:max-w-[300px]"
            key={relatedProduct.id}
            product={relatedProduct}
          />
        ))}
      </div>
    </div>
  )
}
export default RelatedProducts
