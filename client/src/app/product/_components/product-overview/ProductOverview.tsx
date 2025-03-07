import { Product } from "@/types"
import { Separator } from "@/components/ui/separator"
import { Eye, Heart, ShoppingCart, ThumbsUp } from "lucide-react"
import ProductImages from "./ProductImages"
import ProductDetails from "./ProductDetails"
import ProductSpecifications from "./ProductSpecifications"
import { Button } from "@/components/ui/button"

type ProductOverviewProps = {
  product: Product
}

const ProductOverview = ({ product }: ProductOverviewProps) => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <ProductImages images={product.images} name={product.name} />

        <div className="flex justify-around max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="size-8 lg:size-5 text-primary" />
            <span className="text-2xl lg:text-xl text-muted-foreground">
              {product.likes} <span className="hidden lg:inline">likes</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="size-8 lg:size-5  text-primary" />
            <span className="text-2xl lg:text-xl text-muted-foreground">
              {product.views} <span className="hidden lg:inline">views</span>
            </span>
          </div>
        </div>
      </div>
      <Separator className="md:hidden" />
      <div className="space-y-6">
        <ProductDetails
          description={product.description}
          name={product.name}
          price={product.price}
        />

        <div className="flex flex-col space-x-0 gap-3 md:gap-0 md:space-x-4 md:flex-row">
          <Button className="flex-1 p-2" size="lg">
            <ShoppingCart className="mr-2 size-5" />
            Purchase from {product.seller.name}
          </Button>
          <Button variant="outline" className="" size="lg">
            <Heart className="size-5" />
            <span className="sr-only">i like this product</span>
          </Button>
        </div>

        <ProductSpecifications specifications={product.specifications} />
      </div>
    </div>
  )
}
export default ProductOverview
