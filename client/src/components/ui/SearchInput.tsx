"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { type FormEvent, type InputHTMLAttributes } from "react"
import { Button } from "../ui/button"

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string
  onSubmit?: (e: FormEvent) => void
}

const SearchBar = ({
  className,
  inputClassName,
  type = "search",
  onSubmit,
  ...props
}: SearchBarProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form className={cn("relative", className)} onSubmit={handleSubmit}>
      <Button
        variant="ghost"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 hover:bg-opacity-0 p-0"
      >
        <Search className="size-4 text-muted-foreground" />
      </Button>
      <Input
        name="search"
        type={type}
        className={cn("pl-10 text-base", inputClassName)}
        {...props}
      />
    </form>
  )
}
export default SearchBar
