import { Check, Upload, X } from "lucide-react"
import { Button } from "../ui/button"
import { useRef, useState } from "react"
import UserAvatar from "./UserAvatar"
import { Input } from "../ui/input"

type EditProfileProps = {
  name: string
  avatar: string
  email: string
  onCancel: () => void
  onSave: (editName: string, editAvatar: string) => void
}

const EditProfile = ({
  name,
  avatar,
  email,
  onCancel,
  onSave
}: EditProfileProps) => {
  const [editName, setEditName] = useState(name)
  const [editAvatar, setEditAvatar] = useState(avatar)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setEditAvatar(url)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Edit Profile</h4>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onSave(editName, editAvatar)}
          >
            <Check className="h-4 w-4 text-green-500" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onCancel}
          >
            <X className="h-4 w-4 text-destructive" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <UserAvatar src={editAvatar} name={editName} className="h-16 w-16" />
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3" />
            <span className="sr-only">Upload avatar</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="edit-name" className="text-xs font-medium">
            Name
          </label>
          <Input
            id="edit-name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-8"
          />
        </div>

        <div className="w-full">
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  )
}
export default EditProfile
