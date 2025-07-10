import {
  CategoryFilterContent,
  ProductFiltersPanel
} from "../../_components/filter/product-filters-panel"
import ProductRefineSearch from "../../_components/filter/filter-inputs/ProductRefineSearch"
import SortSelect from "../../_components/filter/filter-inputs/SortSelect"
import InfiniteScrollProducts from "../../_components/infinite-scroll/InfiniteScrollProducts"
import getCategoryProducts from "../../_services/getCategoryProducts"
import FilterSlider from "../../_components/filter/FilterSlider"

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
        <div className="flex gap-4">
          <FilterSlider
            filterProps={{ brands, priceRange }}
            type="category-page"
          />
          <SortSelect />
        </div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProductFiltersPanel>
          <CategoryFilterContent brands={brands} priceRange={priceRange} />
        </ProductFiltersPanel>

        <div className="col-span-1 lg:col-span-3">
          <InfiniteScrollProducts hasNext={true} initialProducts={products} />
        </div>
      </main>
    </>
  )
}
export default CategoryPage
