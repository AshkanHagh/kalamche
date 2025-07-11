import ProductSkeleton from "@/components/skeleton/ProductSkeleton"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export const MainSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-y-3 mt-2 mb-8">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-5 w-80 rounded-md" />
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
        <Skeleton className="h-8 md:w-[80%] lg:w-[88%] rounded-md" />
        <div className="flex gap-2 md:w-[20%] lg:w-[13%]">
          <Skeleton className="h-8 rounded-md w-full" />
          <Skeleton className="h-8 rounded-md w-full lg:hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <FilterPanelSkeleton />
        <div className="col-span-3">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 15 }, (_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const FilterPanelSkeleton = () => {
  return (
    <div className="hidden p-6 rounded-lg shadow shadow-primary/15 h-fit lg:block">
      <div className="flex justify-between py-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="flex flex-col gap-4 mt-5">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-full h-3" />
      </div>
      <div className="flex justify-between mt-8">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      <Separator className="my-5" />

      <div className="flex flex-col gap-3">
        <div className="flex justify-between py-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-5 w-24" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
