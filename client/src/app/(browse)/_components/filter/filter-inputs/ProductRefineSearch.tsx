"use client"

import SearchInput from "@/components/ui/SearchInput"
import { useQueryState } from "next-usequerystate"
import { ChangeEvent, useEffect, useRef, useState } from "react"

type ProductRefineSearchInputProps = {
  searchScopeName: string
}

const ProductRefineSearchInput = ({
  searchScopeName
}: ProductRefineSearchInputProps) => {
  const [searchQuery, setSearchQuery] = useQueryState("relatedSearch", {
    defaultValue: "",
    history: "replace"
  })
  const [inputValue, setInputValue] = useState<string>(searchQuery || "")
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    const timeout = setTimeout(() => {
      if (inputValue !== searchQuery) {
        setSearchQuery(inputValue || null)
      }
    }, 600)

    return () => clearTimeout(timeout)
  }, [inputValue])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <SearchInput
      placeholder={`Search in ${searchScopeName}...`}
      onChange={handleChange}
      value={inputValue}
    />
  )
}

export default ProductRefineSearchInput
