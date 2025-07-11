"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ProductSorts } from "../../../_types"
import { useQueryState } from "next-usequerystate"
import { useEffect } from "react"

type SortSelectProps = {
  className?: string
}

const VALID_SORTS: ProductSorts[] = [
  "newest",
  "cheapest",
  "expensive",
  "popular"
]

const SortSelect = ({ className }: SortSelectProps) => {
  const [sortQueryValue, setSortQueryValue] = useQueryState("sort", {
    history: "replace",
    defaultValue: "cheapest"
  })

  useEffect(() => {
    const isValidSort = VALID_SORTS.includes(sortQueryValue as ProductSorts)
    if (!isValidSort) {
      setSortQueryValue("cheapest")
    }
  }, [])

  return (
    <Select onValueChange={setSortQueryValue} value={sortQueryValue}>
      <SelectTrigger className={cn("w-full lg:w-44", className)}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="cheapest">Cheapest</SelectItem>
        <SelectItem value="expensive">Most Expensive</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
      </SelectContent>
    </Select>
  )
}
export default SortSelect
