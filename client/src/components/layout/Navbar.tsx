"use client"

import { Menu, User } from "lucide-react"
import Logo from "../svgs/logo"
import { Button } from "../ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Children } from "react"
// import { ProfileDropdown } from "../profile/ProfileDropdown"
import { useAppSelector } from "@/lib/redux/hooks/useRedux"

type NavbarProps = {
  children: React.ReactNode
}

export const Navbar = ({ children }: NavbarProps) => {
  const user = useAppSelector((state) => state.auth.user)
  const needsUserInit = user === undefined

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="items-center space-x-2 hidden sm:flex">
            <Logo className="size-9" />
            <span className="hidden font-bold sm:inline-block">Kalamche</span>
          </Link>

          <div className="md:hidden">
            <HamburgerMenu>{children}</HamburgerMenu>
          </div>
          <nav className="hidden gap-6 md:flex">{children}</nav>
        </div>

        <div className="flex items-center gap-4">
          {needsUserInit ? (
            <div className="animate-pulse rounded-md bg-muted h-9 w-40" />
          ) : user ? (
            <div />
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">
                <User className="mr-2 h-4 w-4" />
                Login / Register
              </Link>
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

type HamburgerMenuProps = {
  children: React.ReactNode
}

const HamburgerMenu = ({ children }: HamburgerMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-3 py-0 focus-visible:ring-0">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background/90">
        <DropdownMenuGroup>
          {Children.map(children, (child, index) => {
            return (
              <DropdownMenuItem className="pl-4" key={index}>
                {child}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
