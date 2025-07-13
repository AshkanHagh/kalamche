import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { useState } from "react"
import { AuthProviders, Login } from "../_types"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"

type OnSuccess = (data: Login) => void
type OnError = (error: AxiosError<ServerError>) => void
type AuthCallbackQuery = {
  state: string
  code: string
  provider: AuthProviders
}

const useAuthCallback = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<Login | null>(null)

  const authCallback = async (
    query: AuthCallbackQuery,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    const { provider, state, code } = query

    setIsLoading(true)
    try {
      const { data } = await axios.get<Login>(
        `${API_ENDPOINTS.auth.oauth.callback}?code=${code}&state=${state}&provider=${provider}`
      )
      setData(data)
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      setData(null)
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }
  return { authCallback, isLoading, data }
}
export default useAuthCallback
