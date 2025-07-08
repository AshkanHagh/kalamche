"use client"

import ProductCard from "@/components/product/ProductCard"
import ProductSkeleton from "@/components/skeleton/ProductSkeleton"
import { Product, ServerError } from "@/types"
import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import useGetCategoryProducts from "../../_service-hooks/useGetCategoryProducts"
import { CategoryResponse } from "../../_types"
import { handleApiError } from "@/lib/utils"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type InfiniteScrollProductsProps = {
  initialProducts: Product[]
  hasNext: boolean
}

const PRODUCTS_LIMIT = 15

const InfiniteScrollProducts = ({
  initialProducts,
  hasNext
}: InfiniteScrollProductsProps) => {
  const [hasNextState, setHasNextState] = useState<boolean>(hasNext)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [offset, setOffset] = useState<number>(initialProducts.length)
  const [infinityScrollError, setInfinityScrollError] =
    useState<AxiosError<ServerError> | null>(null)
  const [resetLoading, setResetLoading] = useState<boolean>(false)
  const [error, setError] = useState<AxiosError<ServerError> | null>(null)
  const { getCategoryProducts, isLoading } = useGetCategoryProducts()
  const { ref, inView } = useInView({ delay: 800 })
  const searchQuery = useSearchParams()
  const lastQueryRef = useRef<string>(searchQuery.toString())
  console.log(lastQueryRef.current)

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

  const handleSuccess = (data: CategoryResponse) => {
    const newProducts = data.products || []
    setProducts((prev) => [...prev, ...newProducts])
    setHasNextState(data.hasNext)
    setOffset((prev) => prev + PRODUCTS_LIMIT)
    setResetLoading(false)
  }

  const loadMore = async () => {
    setInfinityScrollError(null)

    await getCategoryProducts(
      { limit: PRODUCTS_LIMIT, offset },
      handleSuccess,
      (error) => {
        if (error.code === "ERR_CANCELED") return
        setInfinityScrollError(error)
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
        setResetLoading(false)
      }
    )
  }

  // It's for when the filter is changed.
  const resetAndFetchNewProducts = async () => {
    setProducts([])
    setHasNextState(false)
    setOffset(0)
    setError(null)

    setResetLoading(true)
    await getCategoryProducts(
      { limit: PRODUCTS_LIMIT, offset: 0 },
      handleSuccess,
      (error) => {
        if (error.code === "ERR_CANCELED") return
        setError(error)
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
        setResetLoading(false)
      }
    )
  }

  // UI --------
  if (resetLoading) {
    return (
      <ul className="grid grid-cols-2 gap-1.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 18 }).map((_, index) => (
          <li key={index}>
            <ProductSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <Button
          className="bg-red-500 hover:bg-red-400 mx-auto"
          size="lg"
          onClick={resetAndFetchNewProducts}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (products.length === 0 && !isLoading) {
    return (
      <p className="text-center text-muted-foreground mt-4">
        No products found.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-1.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}

      {infinityScrollError && (
        <li className="col-span-4 flex justify-center">
          <Button className="bg-red-500 hover:bg-red-400" onClick={loadMore}>
            Try Again
          </Button>
        </li>
      )}

      {hasNextState &&
        !infinityScrollError &&
        Array.from({ length: 18 }).map((_, index) => (
          <li ref={index < 1 ? ref : undefined} key={index}>
            <ProductSkeleton />
          </li>
        ))}
    </ul>
  )
}
export default InfiniteScrollProducts
