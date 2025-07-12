"use client"

import SearchInput from "@/components/ui/SearchInput"
import { useQueryState } from "next-usequerystate"
import { useState } from "react"

const SearchBar = () => {
  const [searchValue, setSearchValue] = useQueryState("q", { defaultValue: "" })
  const [value, setValue] = useState<string>(searchValue)

  const handleSubmit = () => {
    setSearchValue(value)
  }

  return (
    <SearchInput
      onChange={(e) => setValue(e.target.value)}
      value={value}
      onSubmit={handleSubmit}
    />
  )
}
export default SearchBar
