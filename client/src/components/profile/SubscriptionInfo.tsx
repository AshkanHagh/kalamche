"use client"

import { Subscription } from "@/types"
import { Button } from "../ui/button"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"

type SubscriptionInfoProps = {
  memberSince: Date
  subscription: Subscription
  setIsOpen: (state: boolean) => void
}

const SubscriptionInfo = ({
  memberSince,
  subscription,
  setIsOpen
}: SubscriptionInfoProps) => {
  const router = useRouter()

  const getSubscriptionText = () => {
    if (subscription.status === "active" && subscription?.endDate) {
      const daysLeft = Math.ceil(
        (subscription.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
      return `${daysLeft} days remaining`
    }
    return "No active subscription"
  }

  const handleSubscriptionClick = () => {
    router.push("/subscription")
    setIsOpen(false)
  }

  const getSubscriptionBadge = () => {
    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-500 text-white">
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h5 className="text-sm font-medium">Subscription</h5>
            {getSubscriptionBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {getSubscriptionText()}
          </p>
        </div>
        {subscription.status === "inactive" && (
          <Button size="sm" className="h-8" onClick={handleSubscriptionClick}>
            Upgrade
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Member since: {format(memberSince, "yyyy/MM/dd")}
      </div>
    </div>
  )
}
export default SubscriptionInfo
