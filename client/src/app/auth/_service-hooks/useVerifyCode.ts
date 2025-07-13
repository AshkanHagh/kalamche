import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { Login, VerifyCodeBody } from "../_types"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"

type OnSuccess = (data: Login) => void
type OnError = (error: AxiosError<ServerError>) => void

const useVerifyCode = () => {
  const verifyCode = async (
    verifyCodeBody: VerifyCodeBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await axios.post<Login>(
        API_ENDPOINTS.auth.verify.verifyCode,
        verifyCodeBody
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
    }
  }
  return { verifyCode }
}
export default useVerifyCode
