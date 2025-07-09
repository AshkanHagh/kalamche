import ProductCard from "@/components/product/ProductCard"
import ProductSkeleton from "@/components/skeleton/ProductSkeleton"
import { Button } from "@/components/ui/button"
import { Product, ServerError } from "@/types"
import { AxiosError } from "axios"
import { Ref } from "react"

type ProductListWrapperProps = {
  resetAndFetchNewProducts: () => void
  loadMore: () => void
  error: AxiosError<ServerError> | null
  products: Product[]
  infinityScrollError: AxiosError<ServerError> | null
  hasNext: boolean
  isLoading: boolean
  resetLoading: boolean
  infiniteScrollRef: Ref<HTMLLIElement>
}

const ProductListWrapper = ({
  error,
  hasNext,
  infinityScrollError,
  isLoading,
  products,
  resetLoading,
  resetAndFetchNewProducts,
  loadMore,
  infiniteScrollRef
}: ProductListWrapperProps) => {
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

      {hasNext &&
        !infinityScrollError &&
        Array.from({ length: 18 }).map((_, index) => (
          <li ref={index < 1 ? infiniteScrollRef : undefined} key={index}>
            <ProductSkeleton />
          </li>
        ))}
    </ul>
  )
}
export default ProductListWrapper
