"use client"

import SearchInput from "@/components/ui/SearchInput"
import { useRouter } from "next/navigation"
import { useState } from "react"

const SearchBar = () => {
  const router = useRouter()
  const [value, setValue] = useState<string>("")

  const handleSubmit = () => {
    router.push(`/search?q=${value}`)
  }

  return (
    <SearchInput
      className="mx-auto max-w-md md:max-w-2xl mb-5 mt-10"
      inputClassName="py-5"
      placeholder="Search for products, brands, or categories..."
      onSubmit={handleSubmit}
      onChange={(e) => setValue(e.target.value)}
      value={value}
    />
  )
}
export default SearchBar
