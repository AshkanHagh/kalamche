"use client"

import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import PriceRangeFilter from "./product-filters/PriceRangeFilter"

type CategoryFilterPanelProps = {
  children: React.ReactNode
}

export const ProductFiltersPanel = ({ children }: CategoryFilterPanelProps) => {
  return (
    <section className="hidden lg:block">
      <div className="sticky top-24 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </h2>
          <Button variant="ghost">Reset</Button>
        </div>

        {/* Filter Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}

export const CategoryFilterContent = () => {
  return (
    <>
      <PriceRangeFilter priceRange={{ min: 0, max: 1000 }} />
    </>
  )
}
