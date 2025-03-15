import { cn, extractNameLetters } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

type UserAvatarProps = {
  className?: string
  src: string
  name: string
}

const UserAvatar = ({ className, src, name }: UserAvatarProps) => {
  return (
    <Avatar className={cn("border border-border size-8", className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {extractNameLetters(name)}
      </AvatarFallback>
    </Avatar>
  )
}
export default UserAvatar
