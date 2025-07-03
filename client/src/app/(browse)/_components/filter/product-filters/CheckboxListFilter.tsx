"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

type CheckboxListFilterProps = {
  title: string
  checkboxLabels: string[]
}

const CheckboxListFilter = ({
  title,
  checkboxLabels
}: CheckboxListFilterProps) => {
  const [showMore, setShowMore] = useState<boolean>(false)
  const checkboxLabelsLength = checkboxLabels.length

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        {checkboxLabelsLength > 4 && (
          <Button
            onClick={() => setShowMore((prev) => !prev)}
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
          >
            {showMore ? (
              <ChevronDown className="size-2 -mr-2" />
            ) : (
              <ChevronRight className="size-2 -mr-2" />
            )}
            {showMore ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {checkboxLabels
          .slice(0, showMore ? checkboxLabelsLength : 4)
          .map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox id={`brand-${brand.toLowerCase()}`} />
              <label
                htmlFor={`brand-${brand.toLowerCase()}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand}
              </label>
            </div>
          ))}
      </div>
    </div>
  )
}
export default CheckboxListFilter
