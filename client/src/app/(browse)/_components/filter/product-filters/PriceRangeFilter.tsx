"use client"

import { PriceRange } from "@/app/(browse)/_types"
import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/utils"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type PriceRangeFilterProps = {
  priceRange: PriceRange
}

const PriceRangeFilter = ({ priceRange }: PriceRangeFilterProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const rawMin = Number(searchParams.get("prMin"))
  const rawMax = Number(searchParams.get("prMax"))

  const isValid = (val: number) =>
    !isNaN(val) && val >= priceRange.min && val <= priceRange.max

  const minValue = isValid(rawMin) ? rawMin : priceRange.min
  const maxValue = isValid(rawMax) ? rawMax : priceRange.max

  const [priceRangeValue, setPriceRangeValue] = useState<number[]>([
    Math.min(minValue, maxValue),
    Math.max(minValue, maxValue)
  ])

  const handleValueChange = ([min, max]: number[]) => {
    setPriceRangeValue([min, max])

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("prMin", String(min))
      params.set("prMax", String(max))

      router.push(`?${params.toString()}`)
    }, 1350)
  }

  useEffect(() => {
    // Sync query with corrected values (e.g. if user typed ?prMin=900&prMax=100)
    const correctedMin = Math.min(minValue, maxValue)
    const correctedMax = Math.max(minValue, maxValue)

    const needCorrection = correctedMin !== rawMin || correctedMax !== rawMax

    if (needCorrection) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("prMin", String(correctedMin))
      params.set("prMax", String(correctedMax))
      router.replace(`?${params.toString()}`)
    }
  }, [])

  return (
    <div>
      <h3 className="font-medium mb-4">Price Range</h3>
      <Slider
        min={priceRange.min}
        max={priceRange.max}
        step={10}
        value={priceRangeValue}
        onValueChange={handleValueChange}
        className="mb-6"
      />
      <div className="flex items-center justify-between">
        <div className="rounded-md border px-3 py-2 bg-background">
          <span className="text-sm font-light">
            {formatPrice(priceRangeValue[0])}
          </span>
        </div>
        <div className="rounded-md border px-3 py-2 bg-background">
          <span className="text-sm font-light">
            {formatPrice(priceRangeValue[1])}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PriceRangeFilter
