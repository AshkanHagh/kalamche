"use client"

import { useEffect, useState } from "react"
import VerificationStatus from "../_components/verification/VerificationStatus"
import useAuthCallback from "../../_services/useAuthCallback"
import { useParams, useSearchParams } from "next/navigation"
import { AuthProviders } from "../../_types"

type Params = {
  provider: AuthProviders
}

const CallbackPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const { authCallback, data } = useAuthCallback()
  const { provider } = useParams<Params>()
  const query = useSearchParams()
  const state = query.get("state")
  const code = query.get("code")

  useEffect(() => {
    const handleCallback = async () => {
      if (!state || !code) return setStatus("error")
      await authCallback(
        { provider, code, state },
        () => setStatus("success"),
        () => setStatus("error")
      )
    }
    handleCallback()
  }, [code, provider, state])

  const handleVerificationSuccess = () => {
    const opener = window.opener
    if (!opener) return
    // TODO: Change Origin
    opener.postMessage({ type: "CALLBACK_VERIFY", ...data }, "*")
    window.close()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <VerificationStatus
          errorMessage="something went wrong"
          status={status}
          onSuccess={handleVerificationSuccess}
        />
      </div>
    </div>
  )
}

export default CallbackPage
