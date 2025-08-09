import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { useState } from "react"
import { AuthProviders, SocialAuthResponse } from "../_types"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"

type OnSuccess = (data: SocialAuthResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getSocialAuth = async (
    provider: AuthProviders,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setIsLoading(true)
    try {
      const { data } = await axios.get<SocialAuthResponse>(
        `${API_ENDPOINTS.oauth.authorize}?provider=${provider}`
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }
  return { getSocialAuth, isLoading }
}
export default useSocialAuth
