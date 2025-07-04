"use client"

import SearchBar from "@/components/search/SearchBar"
import { useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"

type ProductRefineSearchInputProps = {
  searchScopeName: string
}

const ProductRefineSearchInput = ({
  searchScopeName
}: ProductRefineSearchInputProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [inputValue, setInputValue] = useState("")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    const currentSearchValue = searchParams.get("relatedSearch")
    if (currentSearchValue) {
      setInputValue(currentSearchValue)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (inputValue) {
        params.set("relatedSearch", inputValue)
      } else {
        params.delete("relatedSearch")
      }
      router.push(`?${params.toString()}`)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [inputValue])

  return (
    <SearchBar
      placeholder={`Search in ${searchScopeName}...`}
      onChange={handleChange}
      value={inputValue}
    />
  )
}

export default ProductRefineSearchInput
