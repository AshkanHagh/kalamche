"use client"

import { PriceRange } from "@/app/(browse)/_types"
import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useQueryState } from "next-usequerystate"

type PriceRangeFilterProps = {
  priceRange: PriceRange
}

const PriceRangeFilter = ({ priceRange }: PriceRangeFilterProps) => {
  const [prMin, setPrMin] = useQueryState("prMin", {
    history: "replace"
  })
  const [prMax, setPrMax] = useQueryState("prMax", {
    history: "replace"
  })
  const [priceRangeValue, setPriceRangeValue] = useState<number[]>([
    priceRange.min,
    priceRange.max
  ])

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const parseOrFallback = (val: string | null, fallback: number) => {
    const parsed = Number(val)
    return !isNaN(parsed) &&
      parsed >= priceRange.min &&
      parsed <= priceRange.max
      ? parsed
      : fallback
  }
  useEffect(() => {
    const parsedMin = parseOrFallback(prMin, priceRange.min)
    const parsedMax = parseOrFallback(prMax, priceRange.max)

    const correctedMin = Math.min(parsedMin, parsedMax)
    const correctedMax = Math.max(parsedMin, parsedMax)

    const shouldUpdateQuery =
      correctedMin !== priceRange.min || correctedMax !== priceRange.max

    if (shouldUpdateQuery) {
      setPrMin(String(correctedMin))
      setPrMax(String(correctedMax))
    }

    setPriceRangeValue([correctedMin, correctedMax])
  }, [])

  const handleValueChange = ([min, max]: number[]) => {
    setPriceRangeValue([min, max])

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setPrMin(String(min))
      setPrMax(String(max))
    }, 1000)
  }

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
