"use client"

import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import PriceRangeFilter from "./filter-panel-components/PriceRangeFilter"
import CheckboxListFilter from "./filter-panel-components/CheckboxListFilter"
import { Separator } from "@/components/ui/separator"
import { Checkbox, PriceRange } from "../../_types"

type CategoryFilterPanelProps = {
  children: React.ReactNode
}

export type CategoryFilterContentProps = {
  priceRange: PriceRange
  brands: Checkbox[]
}
export type SearchFilterContentProps = {
  priceRange: PriceRange
  brands: Checkbox[]
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

export const CategoryFilterContent = ({
  priceRange,
  brands
}: CategoryFilterContentProps) => {
  return (
    <>
      <PriceRangeFilter
        priceRange={{ min: priceRange.min, max: priceRange.max }}
      />
      <Separator className="my-1" />
      <CheckboxListFilter title="Brands" checkboxes={brands} keyName="brand" />
    </>
  )
}
export const SearchFilterContent = ({
  priceRange,
  brands
}: SearchFilterContentProps) => {
  return (
    <>
      <PriceRangeFilter
        priceRange={{ min: priceRange.min, max: priceRange.max }}
      />
      <Separator className="my-1" />
      <CheckboxListFilter title="Brands" checkboxes={brands} keyName="brand" />
    </>
  )
}
