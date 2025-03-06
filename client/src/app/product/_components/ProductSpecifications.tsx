import { Specification } from "@/types"

type ProductSpecifications = {
  specifications: Specification[]
}

const ProductSpecifications = ({ specifications }: ProductSpecifications) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Product Specifications
      </h2>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {specifications.map((specification, index) => (
          <div key={index} className="flex justify-between sm:block">
            <dt className="text-sm font-medium text-muted-foreground">
              {specification.label}
            </dt>
            <dd className="text-sm text-foreground sm:mt-1">
              {specification.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
export default ProductSpecifications
