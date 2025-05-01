"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ProductSorts } from "../../_types"
import { useRouter, useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawSort = searchParams.get("sort")
  const initialSort = VALID_SORTS.includes(rawSort as ProductSorts)
    ? (rawSort as ProductSorts)
    : "cheapest"
  const [value, setValue] = useState<ProductSorts>(initialSort)

  const handleChange = (newValue: ProductSorts) => {
    setValue(newValue)

    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", newValue)

    router.push(`?${params.toString()}`)
  }

  return (
    <Select onValueChange={handleChange} value={value}>
      <SelectTrigger className={cn("w-full md:w-44", className)}>
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
