"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

type ResendCodeProps = {
  onResend: () => Promise<void>
}

const ResendCode = ({ onResend }: ResendCodeProps) => {
  const [cooldown, setCooldown] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleResend = async () => {
    if (cooldown > 0) return

    setIsLoading(true)
    try {
      await onResend()
      setCooldown(59)
    } catch (e) {
      console.log(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setCooldown(29)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  return (
    <div className="text-center text-sm text-muted-foreground">
      Didn&apos;t receive a code?{" "}
      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || isLoading}
        className={`font-medium text-primary transition-colors hover:text-primary/90 ${
          cooldown > 0 || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Resending...
          </span>
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          "Resend code"
        )}
      </button>
    </div>
  )
}
export default ResendCode
