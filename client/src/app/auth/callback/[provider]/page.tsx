"use client"

import { useEffect, useState } from "react"
import VerificationStatus from "../_components/verification/VerificationStatus"

// Simulated server request function
const verifyUser = async (): Promise<{
  success: boolean
  message: string
  redirectUrl?: string
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = true

      if (isSuccess) {
        resolve({
          success: true,
          message: "Your account has been successfully verified!",
          redirectUrl: "/dashboard"
        })
      } else {
        reject({
          success: false,
          message:
            "Verification failed. The link may have expired or is invalid."
        })
      }
    }, 2000) // Simulate network delay
  })
}

const CallbackPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        await verifyUser()
        setStatus("success")
      } catch (e) {
        const error = e as Error
        console.log(error)
        setStatus("error")
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <VerificationStatus
          errorMessage="something went wrong"
          status={status}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}

export default CallbackPage
