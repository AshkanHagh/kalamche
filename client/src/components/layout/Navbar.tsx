"use client"

import { User } from "lucide-react"
import Logo from "../svgs/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavbarProps = {
  children: React.ReactNode
}

export const Navbar = ({ children }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Logo height="35px" width="35px" />
            <span className="hidden font-bold sm:inline-block">Kalamche</span>
          </Link>
          <nav className="hidden gap-6 md:flex">{children}</nav>
        </div>
        <div className="flex items-center gap-4">
          {false ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

type NavLinkProps = {
  children: React.ReactNode
  href: string
}

export const NavLink = ({ children, href }: NavLinkProps) => {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href && "border-b border-black/80"
      )}
    >
      {children}
    </Link>
  )
}
