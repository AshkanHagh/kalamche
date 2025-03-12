import { Discord, GitHub } from "@/components/svgs/icon"
import { Button } from "@/components/ui/button"

const SocialAuthButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="outline" type="button">
        <GitHub className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button variant="outline" type="button">
        <Discord className="mr-2 h-4 w-4" />
        Discord
      </Button>
    </div>
  )
}
export default SocialAuthButtons
