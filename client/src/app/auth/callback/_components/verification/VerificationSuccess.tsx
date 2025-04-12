"use client"

import { CheckCircle2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"

type VerificationSuccessProps = {
  onSuccess?: () => void
}

const VerificationSuccess = ({ onSuccess }: VerificationSuccessProps) => {
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const hasCalledSuccess = useRef(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)

          // prevent double call
          if (!hasCalledSuccess.current) {
            hasCalledSuccess.current = true
            onSuccess?.()
          }

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-8 shadow-lg dark:border-green-900 dark:bg-green-900/20 transition-all duration-300">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-green-800 dark:text-green-400">
          Verification Successful
        </h2>
        <p className="text-green-700 dark:text-green-300">
          Your account has been successfully verified!
        </p>
        <div className="mt-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/40 dark:text-green-300">
          Redirecting in {redirectCountdown} seconds...
        </div>
      </div>
    </div>
  )
}

export default VerificationSuccess
