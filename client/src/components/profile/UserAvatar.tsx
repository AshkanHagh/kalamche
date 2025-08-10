import { cn, extractNameLetters } from "@/lib/utils"
import { Avatar, AvatarFallback } from "../ui/avatar"

type UserAvatarProps = {
  className?: string
  name: string
}

const UserAvatar = ({ className, name }: UserAvatarProps) => {
  return (
    <Avatar className={cn("border border-border size-8", className)}>
      <AvatarFallback className="bg-primary/10 text-primary">
        {extractNameLetters(name)}
      </AvatarFallback>
    </Avatar>
  )
}
export default UserAvatar
