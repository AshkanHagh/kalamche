import { redirect } from "next/navigation"
import SearchBar from "../_components/filter/filter-inputs/SearchBar"
import SortSelect from "../_components/filter/filter-inputs/SortSelect"
import FilterSlider from "../_components/filter/FilterSlider"
import {
  ProductFiltersPanel,
  SearchFilterContent
} from "../_components/filter/product-filters-panel"
import InfiniteScrollProducts from "../_components/infinite-scroll/InfiniteScrollProducts"
import getSearchProducts from "../_services/getSearchProducts"

type SearchParams = {
  searchParams: Promise<{
    q?: string
  }>
}

const SearchPage = async ({ searchParams }: SearchParams) => {
  const { q: searchQuery } = await searchParams

  console.log(await searchParams)

  if (searchQuery === undefined) {
    redirect("/")
  }

  const searchResponse = await getSearchProducts(searchQuery, 0, 15)

  if (!searchResponse.isSuccess) {
    throw new Error(
      `Failed to fetch products for ${searchParams}: ${searchResponse.errorMessage}`
    )
  }

  const { brands, priceRange, products } = searchResponse.data

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold capitalize">{searchQuery}</h1>
        <p className="text-muted-foreground mt-2">
          Explore our range of {searchQuery.toLowerCase()} products
        </p>
      </div>
      <section className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchBar />
        </div>
        <div className="flex gap-4">
          <FilterSlider
            filterProps={{ brands, priceRange }}
            type="search-page"
          />
          <SortSelect />
        </div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <ProductFiltersPanel>
          <SearchFilterContent brands={brands} priceRange={priceRange} />
        </ProductFiltersPanel>

        <div className="col-span-1 lg:col-span-3">
          <InfiniteScrollProducts hasNext={true} initialProducts={products} />
        </div>
      </main>
    </>
  )
}
export default SearchPage
