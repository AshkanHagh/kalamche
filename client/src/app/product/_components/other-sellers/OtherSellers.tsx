"use client"

import { Button } from "@/components/ui/button"
import { OtherSeller } from "@/types"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import OtherSellerCard from "./OtherSellerCard"

type OtherSellersProps = {
  otherSellers: OtherSeller[]
}

const OtherSellers = ({ otherSellers }: OtherSellersProps) => {
  const [expandedSellers, setExpandedSellers] = useState<boolean>(false)

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Other Sellers</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {otherSellers
          .slice(0, expandedSellers ? undefined : 5)
          .map((seller) => (
            <OtherSellerCard key={seller.id} seller={seller} />
          ))}
      </div>
      {otherSellers.length > 5 && (
        <Button
          variant="outline"
          className="mt-6 mx-auto flex"
          onClick={() => setExpandedSellers(!expandedSellers)}
        >
          {expandedSellers ? (
            <>
              Show Less
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              Show More
              <ChevronDown className="size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
export default OtherSellers
