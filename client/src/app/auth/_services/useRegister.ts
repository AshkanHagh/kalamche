import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { useState } from "react"
import { RegisterBody, RegisterResponse } from "../_types"

type OnSuccess = (data: RegisterResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

const useRegister = () => {
  const [data, setData] = useState<RegisterResponse | null>(null)
  const [error, setError] = useState<AxiosError<ServerError> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const register = async (
    form: RegisterBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setError(null)
    setIsLoading(true)
    try {
      const { data } = await axios.post<RegisterResponse>(
        "/auth/register",
        form
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
  return { register, data, error, isLoading }
}
export default useRegister
