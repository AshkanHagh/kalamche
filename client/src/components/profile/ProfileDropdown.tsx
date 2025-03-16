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
import { currentUser } from "@/data/mockData"
import UserAvatar from "./UserAvatar"
import EditProfile from "./EditProfile"
import SubscriptionInfo from "./SubscriptionInfo"
import Link from "next/link"

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
          <UserAvatar name={currentUser.name} src={currentUser.avatar} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {isEditing ? (
          <EditProfile
            avatar={currentUser.avatar}
            email={currentUser.email}
            name={currentUser.name}
            onCancel={onCancel}
            onSave={onSave}
          />
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <UserAvatar name={currentUser.name} src={currentUser.avatar} />

              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{currentUser.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
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
        <SubscriptionInfo
          memberSince={currentUser.memberSince}
          setIsOpen={setIsOpen}
          subscription={currentUser.subscription}
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
