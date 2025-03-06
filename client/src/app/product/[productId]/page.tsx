import { product } from "@/data/mockData"
import ProductOverview from "../_components/ProductOverview"

const Product = () => {
  return (
    <>
      <ProductOverview product={product} />
    </>
  )
}
export default Product
