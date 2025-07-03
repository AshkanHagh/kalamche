"use client"

import ProductCard from "@/components/product/ProductCard"
import ProductSkeleton from "@/components/skeleton/ProductSkeleton"
import { Product } from "@/types"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import useGetCategoryProducts from "../../_service-hooks/useGetCategoryProducts"
import { CategoryResponse } from "../../_types"
import { handleApiError } from "@/lib/utils"
import { toast } from "sonner"

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
  const { getCategoryProducts, isLoading } = useGetCategoryProducts()
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextState && !isLoading) {
      loadMore()
    }
  }, [inView, hasNextState, isLoading])

  const loadMore = async () => {
    const handleSuccess = (data: CategoryResponse) => {
      const newProducts = data.products || []
      setProducts((prev) => [...prev, ...newProducts])
      setHasNextState(data.hasNext)
      setOffset((prev) => prev + PRODUCTS_LIMIT)
    }

    await getCategoryProducts(
      { limit: PRODUCTS_LIMIT, offset },
      handleSuccess,
      (error) => {
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
      }
    )
  }

  if (products.length === 0) {
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

      {hasNextState &&
        Array(10)
          .fill("")
          .map((_, index) => (
            <li ref={index < 1 ? ref : undefined} key={index}>
              <ProductSkeleton />
            </li>
          ))}
    </ul>
  )
}
export default InfiniteScrollProducts
