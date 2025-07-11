"use client"

import type { Product } from "@/types"
import ProductListWrapper from "./ProductListWrapper"
import useInfiniteScrollProducts from "../../_hooks/useInfiniteScrollProducts"

type InfiniteScrollProductsProps = {
  initialProducts: Product[]
  hasNext: boolean
}

const PRODUCTS_LIMIT = 15

const InfiniteScrollProducts = ({
  initialProducts,
  hasNext
}: InfiniteScrollProductsProps) => {
  const {
    products,
    hasNext: hasNextState,
    resetLoading,
    error,
    isLoading,
    loadMore,
    resetAndFetchNewProducts,
    infiniteScrollRef,
    infinityScrollError
  } = useInfiniteScrollProducts({
    hasNext,
    initialProducts,
    productsLimit: PRODUCTS_LIMIT
  })

  return (
    <ProductListWrapper
      error={error}
      hasNext={hasNextState}
      infiniteScrollRef={infiniteScrollRef}
      infinityScrollError={infinityScrollError}
      isLoading={isLoading}
      loadMore={loadMore}
      products={products}
      resetAndFetchNewProducts={resetAndFetchNewProducts}
      resetLoading={resetLoading}
    />
  )
}
export default InfiniteScrollProducts
