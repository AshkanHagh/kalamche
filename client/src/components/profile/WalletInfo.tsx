import { Wallet, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { timeAgo } from "@/lib/utils"
import { LastTransaction } from "@/types"

type WalletInfoProps = {
  frTokens: number
  lastTransaction: LastTransaction | null
}

const WalletInfo = ({ frTokens, lastTransaction }: WalletInfoProps) => {
  return (
    <div className="p-4 space-y-3">
      {/* Redesigned wallet section */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-medium">Wallet Balance</h5>
          </div>
          <Badge
            variant="outline"
            className="bg-background text-xs font-semibold"
          >
            FR Token
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground">
            {frTokens.toLocaleString()}
            <span className="text-sm font-medium"> FR</span>
          </p>
          <Button size="sm" className="h-8">
            <TrendingUp className="mr-1 h-3 w-3" />
            Add Funds
          </Button>
        </div>
      </div>

      {lastTransaction && (
        <div className="rounded-md bg-muted/50 p-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Last transaction:</span>
            <span className="font-medium text-foreground">
              +{lastTransaction.frTokens} FR
            </span>
          </div>
          <div className="mt-1 text-muted-foreground">
            {timeAgo(lastTransaction.createdAt)}
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletInfo
