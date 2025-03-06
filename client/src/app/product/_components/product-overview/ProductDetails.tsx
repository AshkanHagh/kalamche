import { Button } from "@/components/ui/button"
import { Seller } from "@/types"
import { Heart, ShoppingCart } from "lucide-react"

type ProductDetailsProps = {
  name: string
  price: number
  seller: Seller
  description: string
}

const ProductDetails = ({
  name,
  price,
  seller,
  description
}: ProductDetailsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        <p className="mt-2 text-2xl font-semibold text-primary">
          ${price.toFixed(2)}
        </p>
      </div>

      <p className="text-muted-foreground">{description}</p>

      <div className="flex space-x-4">
        <Button className="flex-1" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Purchase from {seller.name}
        </Button>
        <Button variant="outline" size="lg">
          <Heart className="h-5 w-5" />
          <span className="sr-only">i like this product</span>
        </Button>
      </div>
    </div>
  )
}
export default ProductDetails
