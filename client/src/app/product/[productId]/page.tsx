import { product } from "../_mock/data"
import ProductOverview from "../_components/product-overview/ProductOverview"
import PriceHistoryChart from "../_components/PriceHistoryChart"
import { Separator } from "@/components/ui/separator"
import OtherSellers from "../_components/other-sellers/OtherSellers"
import RelatedProducts from "../_components/RelatedProducts"

const Product = () => {
  return (
    <>
      <ProductOverview product={product} />
      <Separator className="my-10" />
      <PriceHistoryChart priceHistory={product.priceHistory} />
      <Separator className="my-10" />
      <OtherSellers otherSellers={product.otherSellers} />
      <Separator className="my-10" />
      <RelatedProducts relatedProducts={product.relatedProducts} />
    </>
  )
}
export default Product
