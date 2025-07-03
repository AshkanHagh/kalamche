"use client"

import { Checkbox as CheckboxType } from "@/app/(browse)/_types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type CheckboxListFilterProps = {
  title: string
  checkboxes: CheckboxType[]
  keyName: string
}

const CheckboxListFilter = ({
  title,
  checkboxes,
  keyName
}: CheckboxListFilterProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showMore, setShowMore] = useState<boolean>(false)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const checkboxesLength = checkboxes.length

  useEffect(() => {
    const rawBrand = searchParams.get(keyName)
    const correctBrand = checkboxes.find(
      (checkbox) => checkbox.value === rawBrand
    )
    if (correctBrand) {
      setSelectedValue(correctBrand.value)
    }
  }, [])

  const handleCheckboxChange = (checked: boolean, newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    console.log(newValue)
    if (checked) {
      setSelectedValue(newValue)
      params.set(keyName, newValue)
    } else {
      setSelectedValue(null)
      params.delete(keyName, newValue)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        {checkboxesLength > 4 && (
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
        {checkboxes
          .slice(0, showMore ? checkboxesLength : 4)
          .map((checkbox) => (
            <div key={checkbox.value} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${checkbox.value}`}
                checked={selectedValue === checkbox.value}
                onCheckedChange={(checked: boolean) =>
                  handleCheckboxChange(checked, checkbox.value)
                }
              />
              <label
                htmlFor={`brand-${checkbox.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {checkbox.label}
              </label>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CheckboxListFilter
