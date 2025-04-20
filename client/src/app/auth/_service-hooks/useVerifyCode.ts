import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { Login, VerifyCodeBody } from "../_types"

type OnSuccess = (data: Login) => void
type OnError = (error: AxiosError<ServerError>) => void

const useVerifyCode = () => {
  const verifyCode = async (
    verifyCodeBody: VerifyCodeBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await axios.post<Login>("/auth/verify", verifyCodeBody)
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
