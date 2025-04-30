"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { InputHTMLAttributes } from "react"

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string
}

const SearchBar = ({
  className,
  inputClassName,
  type = "search",
  ...props
}: SearchBarProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="
              absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type={type}
          className={cn("pl-10 text-base", inputClassName)}
          {...props}
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
        </ul>
      )}
    </div>
  )
}
export default SearchBar
