"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CategoryFilterContent,
  CategoryFilterContentProps
} from "./product-filters-panel"
import { useSearchParams } from "next/navigation"

type FilterSliderProps = {
  type: "category-page" | "search-page"
  filterProps: CategoryFilterContentProps
}

const FilterSlider = ({ type, filterProps }: FilterSliderProps) => {
  const [isOen, setIsOpen] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const lastQueryRef = useRef(searchParams.toString())

  useEffect(() => {
    if (lastQueryRef.current !== searchParams.toString()) {
      setIsOpen(false)
    }
  }, [searchParams])

  return (
    <>
      <Sheet open={isOen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="w-full lg:hidden">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            {type === "category-page" ? (
              <CategoryFilterContent {...filterProps} />
            ) : (
              <div>unknown</div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
export default FilterSlider
