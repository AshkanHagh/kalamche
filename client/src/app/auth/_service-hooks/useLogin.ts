import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { AuthBody, LoginResponse } from "../_types"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"

type OnSuccess = (data: LoginResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useLogin = () => {
  const login = async (
    form: AuthBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        API_ENDPOINTS.api.auth.login,
        form,
        { baseURL: "/" }
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
    }
  }
  return { login }
}
export default useLogin
