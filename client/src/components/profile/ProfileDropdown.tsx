"use client"

import type React from "react"

import { useState } from "react"
import { LogOut, HelpCircle, ChevronRight, Edit2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import UserAvatar from "./UserAvatar"
import EditProfile from "./EditProfile"
import Link from "next/link"
import WalletInfo from "./WalletInfo"
import { useAppSelector } from "@/lib/redux/hooks/useRedux"
import { User } from "@/types"

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { avatarUrl, email, name, wallet } = useAppSelector(
    (state) => state.auth.user
  ) as User

  const handleLogout = () => {
    setIsOpen(false)
  }

  const onCancel = () => {
    setIsEditing(false)
  }

  const onSave = (editName: string, editAvatar: string) => {
    console.log(editName, editAvatar)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <UserAvatar name={name} src={avatarUrl} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {isEditing ? (
          <EditProfile
            avatarUrl={avatarUrl}
            email={email}
            name={name}
            onCancel={onCancel}
            onSave={onSave}
          />
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <UserAvatar name={name} src={avatarUrl} />

              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{name}</h4>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit profile</span>
            </Button>
          </div>
        )}

        <DropdownMenuSeparator />
        <WalletInfo
          frTokens={wallet.frTokens}
          lastTransaction={wallet.lastTransaction}
        />
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/help" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </Link>
            <ChevronRight className="ml-auto h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
