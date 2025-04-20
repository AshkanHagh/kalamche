import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { AuthBody, VerificationResponse } from "../_types"

type OnSuccess = (data: VerificationResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useRegister = () => {
  const register = async (
    form: AuthBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await axios.post<VerificationResponse>(
        "/auth/register",
        form
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
    }
  }
  return { register }
}
export default useRegister
