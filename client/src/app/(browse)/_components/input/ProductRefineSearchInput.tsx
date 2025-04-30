"use client"

import SearchBar from "@/components/search/SearchBar"
import { cn } from "@/lib/utils"

type ProductRefineSearchInputProps = {
  searchScopeName: string
  className?: string
}

const ProductRefineSearchInput = ({
  searchScopeName,
  className
}: ProductRefineSearchInputProps) => {
  return (
    <SearchBar
      placeholder={`Search in ${searchScopeName}...`}
      className={cn(className)}
      onChange={(e) => console.log(e.target.value)}
    />
  )
}
export default ProductRefineSearchInput
