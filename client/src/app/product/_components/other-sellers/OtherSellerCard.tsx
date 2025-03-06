import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { OtherSeller } from "@/types"
import Image from "next/image"

type OtherSellerCardProps = {
  seller: OtherSeller
}

const OtherSellerCard = ({ seller }: OtherSellerCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center space-x-4">
          <Image
            src={seller.logo}
            alt={seller.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-foreground">{seller.name}</h3>
            <p className="text-sm text-muted-foreground">
              {seller.rating} out of 5 stars
            </p>
          </div>
        </div>
        <div className="flex-grow">
          <p className="mt-4 text-2xl font-bold text-primary">
            ${seller.price.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {seller.description}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full mt-4">
          Go to
          <span className="border-b border-black/30">{seller.name}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
export default OtherSellerCard
