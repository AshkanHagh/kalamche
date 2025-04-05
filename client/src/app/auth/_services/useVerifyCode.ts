import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { useState } from "react"
import { Login, VerifyCodeBody } from "../_types"

type OnSuccess = (data: Login) => void
type OnError = (error: AxiosError<ServerError>) => void

const useVerifyCode = () => {
  const [data, setData] = useState<Login | null>(null)
  const [error, setError] = useState<AxiosError<ServerError> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const verifyCode = async (
    verifyCodeBody: VerifyCodeBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setError(null)
    setIsLoading(true)
    try {
      const { data } = await axios.post<Login>("/auth/verify", verifyCodeBody)
      setData(data)
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      setError(error)
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }
  return { verifyCode, data, error, isLoading }
}
export default useVerifyCode
