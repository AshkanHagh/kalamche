"use client"

import { useState } from "react"
import { Check, X, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const UserProfileContent = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com"
  })
  const [tempData, setTempData] = useState(userData)

  const handleSave = () => {
    setUserData(tempData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData(userData)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={tempData.name}
              onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
              className="h-8"
            />
            <Input
              value={tempData.email}
              onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
              className="h-8"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium">{userData.name}</p>
            <p className="text-xs text-muted-foreground">{userData.email}</p>
          </div>
        )}
      </div>
      <div className="ml-4">
        {isEditing ? (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSave}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsEditing(true)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}