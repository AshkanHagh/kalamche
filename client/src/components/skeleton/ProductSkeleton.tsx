import { Skeleton } from "../ui/skeleton"

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg shadow shadow-primary/15">
      <div className="flex flex-col gap-2">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}
export default ProductSkeleton
