import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { useState } from "react"
import { VerificationResponse } from "../_types"

type OnSuccess = (data: VerificationResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useResendCode = () => {
  const [data, setData] = useState<VerificationResponse | null>(null)
  const [error, setError] = useState<AxiosError<ServerError> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const resendCode = async (
    email: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setError(null)
    setIsLoading(true)
    try {
      const { data } = await axios.post<VerificationResponse>(
        "/auth/verify/resend",
        { email }
      )
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
  return { resendCode, data, error, isLoading }
}
export default useResendCode
