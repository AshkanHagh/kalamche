"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const SearchBar = () => {
  return (
    <section className="container py-8 md:py-12">
      <div className="relative mx-auto max-w-3xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products, brands, or categories..."
            className="pl-10 pr-4 py-6 text-base"
          />
        </div>
        {false && (
          <ul className="absolute inset-x-0 top-full z-50 mt-1 rounded-md bg-background shadow-md p-2">
            <li className="p-1 py-2 border-b cursor-pointer transition-all opacity-70 hover:opacity-100 hover:text-primary tracking-wider text-sm">
              shahin
            </li>
            <li className="p-1 py-2 border-b cursor-pointer transition-all opacity-70 hover:opacity-100 hover:text-primary tracking-wider text-sm">
              fallah
            </li>
            <li className="p-1 py-2 border-b cursor-pointer transition-all opacity-70 hover:opacity-100 hover:text-primary tracking-wider text-sm">
              nokasht
            </li>
          </ul>
        )}
      </div>
    </section>
  )
}
export default SearchBar
