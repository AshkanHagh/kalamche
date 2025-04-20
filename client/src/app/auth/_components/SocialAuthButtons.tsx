"use client"

import { Discord, GitHub } from "@/components/svgs/icon"
import { Button } from "@/components/ui/button"
import useSocialAuth from "../_service-hooks/useSocialAuth"
import { handleApiError, openBrowserPopup } from "@/lib/utils"
import { toast } from "sonner"
import {
  AuthProviders,
  CallbackVerifyPostMessage,
  SocialAuthResponse
} from "../_types"
import { AxiosError } from "axios"
import { ServerError } from "@/types"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { useDispatch } from "react-redux"

const SocialAuthButtons = () => {
  const { getSocialAuth } = useSocialAuth()
  const { replace } = useRouter()
  const dispatch = useDispatch()

  const handleClick = async (provider: AuthProviders) => {
    const handleSocialSuccess = (data: SocialAuthResponse) => {
      openBrowserPopup(data.url)
    }
    const handleSocialError = (error: AxiosError<ServerError>) => {
      const { errorMessage } = handleApiError(error)
      toast.error(errorMessage)
    }

    await getSocialAuth(provider, handleSocialSuccess, handleSocialError)
  }

  useEffect(() => {
    const handleMessage = (e: MessageEvent<CallbackVerifyPostMessage>) => {
      const data = e.data
      if (data.type !== "CALLBACK_VERIFY") return

      const { user, accessToken } = data
      dispatch(setCredentials({ user, accessToken }))
      toast.success("Login successfully.")
      replace("/")
    }

    addEventListener("message", handleMessage)

    return () => {
      removeEventListener("message", handleMessage)
    }
  }, [replace, dispatch])

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={() => handleClick("github")}
        variant="outline"
        type="button"
      >
        <GitHub className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button
        onClick={() => handleClick("discord")}
        variant="outline"
        type="button"
      >
        <Discord className="mr-2 h-4 w-4" />
        Discord
      </Button>
    </div>
  )
}
export default SocialAuthButtons
