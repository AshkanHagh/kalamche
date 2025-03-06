import { Product } from "@/types"
import { Separator } from "@radix-ui/react-separator"
import { Eye, ThumbsUp } from "lucide-react"
import ProductImages from "./ProductImages"
import ProductDetails from "./ProductDetails"
import ProductSpecifications from "./ProductSpecifications"

type ProductOverviewProps = {
  product: Product
}

const ProductOverview = ({ product }: ProductOverviewProps) => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <ProductImages images={product.images} name={product.name} />

        <Separator className="bg-primary/20" />

        <div className="flex justify-around max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="size-5 text-primary" />
            <span className="text-xl text-muted-foreground">
              {product.likes} likes
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="size-5 text-primary" />
            <span className="text-xl text-muted-foreground">
              {product.views} views
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ProductDetails
          description={product.description}
          name={product.name}
          price={product.price}
          seller={product.seller}
        />

        <ProductSpecifications specifications={product.specifications} />

        <Separator />
      </div>
    </div>
  )
}
export default ProductOverview
