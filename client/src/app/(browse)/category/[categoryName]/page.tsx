import {
  CategoryFilterContent,
  ProductFiltersPanel
} from "../../_components/filter/product-filters-panel"
import ProductRefineSearch from "../../_components/input/ProductRefineSearch"
import SortSelect from "../../_components/select/SortSelect"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import InfiniteScrollProducts from "../../_components/infinite-scroll/InfiniteScrollProducts"
import getCategoryProducts from "../../_services/getCategoryProducts"

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { categoryName } = await params

  const categoryResponse = await getCategoryProducts(categoryName, 0, 15)

  if (!categoryResponse.isSuccess) {
    throw new Error(
      `Failed to fetch products for category ${categoryName}: ${categoryResponse.errorMessage}`
    )
  }

  const { brands, priceRange, products } = categoryResponse.data

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">
          Explore our range of {categoryName.toLowerCase()} products
        </p>
      </div>

      <section className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <ProductRefineSearch searchScopeName={categoryName} />
        </div>
        <div>
          <SortSelect />
        </div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProductFiltersPanel>
          <CategoryFilterContent brands={brands} priceRange={priceRange} />
        </ProductFiltersPanel>

        <div className="col-span-1 lg:col-span-3">
          {true ? (
            <InfiniteScrollProducts hasNext={true} initialProducts={products} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                We couldn&apos;t find any products matching your criteria. Try
                adjusting your filters or search query.
              </p>
              <Button onClick={() => {}}>Reset Filters</Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
export default CategoryPage
