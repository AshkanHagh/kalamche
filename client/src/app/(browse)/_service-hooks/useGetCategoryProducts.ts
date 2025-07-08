import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { CategoryResponse } from "../_types"
import { useRef, useState } from "react"

type OnSuccess = (data: CategoryResponse) => void
type OnError = (error: AxiosError<ServerError>) => void

type GetCategoryProductsProps = {
  offset: number
  limit: number
}

const useGetCategoryProducts = () => {
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const getCategoryProducts = async (
    { offset, limit }: GetCategoryProductsProps,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setIsLoading(true)
    cancelRequest()

    const controller = new AbortController()
    abortControllerRef.current = controller
    try {
      const { data } = await axios.get<CategoryResponse>(
        `/unknown?offset=${offset}&limit=${limit}`,
        { signal: controller.signal }
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }
  return { getCategoryProducts, isLoading, cancelRequest }
}
export default useGetCategoryProducts
