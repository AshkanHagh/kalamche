import { Product, ServerError } from "@/types"
import { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { toast } from "sonner"
import useGetCategoryProducts from "../_service-hooks/useGetCategoryProducts"
import { CategoryResponse } from "../_types"
import { handleApiError } from "@/lib/utils"

type UseInfiniteScrollProductsProps = {
  initialProducts: Product[]
  hasNext: boolean
  productsLimit: number
}

const useInfiniteScrollProducts = ({
  initialProducts,
  hasNext,
  productsLimit
}: UseInfiniteScrollProductsProps) => {
  const [hasNextState, setHasNextState] = useState<boolean>(hasNext)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [offset, setOffset] = useState<number>(initialProducts.length)
  const [infinityScrollError, setInfinityScrollError] =
    useState<AxiosError<ServerError> | null>(null)
  const [resetLoading, setResetLoading] = useState<boolean>(false)
  const [error, setError] = useState<AxiosError<ServerError> | null>(null)
  const { ref, inView } = useInView({ delay: 800 })
  const searchQuery = useSearchParams()
  const lastQueryRef = useRef<string>(searchQuery.toString())

  const { getCategoryProducts, isLoading } = useGetCategoryProducts()

  useEffect(() => {
    if (inView && hasNextState && !isLoading && !infinityScrollError) {
      loadMore()
    }
  }, [inView, hasNextState, isLoading, infinityScrollError])

  useEffect(() => {
    if (lastQueryRef.current !== searchQuery.toString()) {
      lastQueryRef.current = searchQuery.toString()
      resetAndFetchNewProducts()
    }
  }, [searchQuery])

  const handleSuccess = useCallback(
    (data: CategoryResponse) => {
      const newProducts = data.products || []
      setProducts((prev) => [...prev, ...newProducts])
      setHasNextState(data.hasNext)
      setOffset((prev) => prev + productsLimit)
      setResetLoading(false)
    },
    [productsLimit]
  )

  const loadMore = useCallback(async () => {
    setInfinityScrollError(null)

    await getCategoryProducts(
      { limit: productsLimit, offset },
      handleSuccess,
      (error) => {
        if (error.code === "ERR_CANCELED") return
        setInfinityScrollError(error)
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
        setResetLoading(false)
      }
    )
  }, [productsLimit, offset, getCategoryProducts, handleSuccess])

  // It's for when the filter is changed.
  const resetAndFetchNewProducts = useCallback(async () => {
    setProducts([])
    setHasNextState(false)
    setOffset(0)
    setError(null)

    setResetLoading(true)
    await getCategoryProducts(
      { limit: productsLimit, offset: 0 },
      handleSuccess,
      (error) => {
        if (error.code === "ERR_CANCELED") return
        setError(error)
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
        setResetLoading(false)
      }
    )
  }, [productsLimit, getCategoryProducts, handleSuccess])

  return {
    error,
    hasNext,
    infinityScrollError,
    isLoading,
    products,
    resetLoading,
    resetAndFetchNewProducts,
    loadMore,
    infiniteScrollRef: ref
  }
}
export default useInfiniteScrollProducts
