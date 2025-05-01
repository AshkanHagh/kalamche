import ProductRefineSearchInput from "../../_components/input/ProductRefineSearchInput"
import SortSelect from "../../_components/select/SortSelect"

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { categoryName } = await params

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">
          Explore our range of {categoryName.toLowerCase()} products
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <ProductRefineSearchInput searchScopeName={categoryName} />
        </div>
        <div>
          <SortSelect />
        </div>
      </div>
    </>
  )
}
export default CategoryPage
