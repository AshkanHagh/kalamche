import { product } from "@/data/mockData"
import ProductOverview from "../_components/product-overview/ProductOverview"
import PriceHistoryChart from "../_components/PriceHistoryChart"
import { Separator } from "@/components/ui/separator"
import OtherSellers from "../_components/other-sellers/OtherSellers"

const Product = () => {
  return (
    <>
      <ProductOverview product={product} />
      <Separator className="my-10" />
      <PriceHistoryChart priceHistory={product.priceHistory} />
      <Separator className="my-10" />
      <OtherSellers otherSellers={product.otherSellers} />
    </>
  )
}
export default Product
