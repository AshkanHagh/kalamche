import { product } from "@/data/mockData"
import ProductOverview from "../_components/ProductOverview"
import PriceHistoryChart from "../_components/PriceHistoryChart"
import { Separator } from "@/components/ui/separator"

const Product = () => {
  return (
    <>
      <ProductOverview product={product} />
      <Separator className="my-10" />
      <PriceHistoryChart priceHistory={product.priceHistory} />
    </>
  )
}
export default Product
