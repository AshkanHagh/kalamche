import Image from "next/image"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: Product
  className?: string
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden flex h-full flex-col bg-background p-2 sm:p-3 lg:p-4",
        className
      )}
    >
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform hover:scale-105 rounded-lg"
        />
        {product.discount && (
          <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-600">
            -{product.discount}%
          </Badge>
        )}
      </div>
      <CardContent className="flex-grow p-0">
        <div className="gap-1 flex flex-col justify-around h-full">
          <p className="text-sm text-muted-foreground">{product.sellerName}</p>
          <h3 className="font-medium leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex flex-col xs:flex-row items-baseline gap-2">
            <span className="text-base xs:text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 pt-3">
        <Button
          variant="secondary"
          className="w-full bg-primary text-background"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
export default ProductCard
