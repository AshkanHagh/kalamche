import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { VerificationResponse } from "../_types"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"

type OnSuccess = (data: VerificationResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useResendCode = () => {
  const resendCode = async (
    email: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await axios.post<VerificationResponse>(
        API_ENDPOINTS.auth.verify.resend,
        { email }
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
    }
  }
  return { resendCode }
}
export default useResendCode
