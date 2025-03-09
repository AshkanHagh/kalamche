import Image from "next/image"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import type { ProductCardType } from "@/types"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: ProductCardType
  className?: string
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  return (
    <Card
      className={cn(
        "min-w-[252px] max-w-[250px] overflow-hidden flex h-full flex-col",
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
      <CardContent className="p-4 flex-grow">
        <div className="space-y-1 flex flex-col justify-between h-full">
          <p className="text-sm text-muted-foreground">{product.seller}</p>
          <h3 className="font-medium leading-tight line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
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
      <CardFooter className="p-4 pt-0">
        <Button variant="secondary" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
export default ProductCard
