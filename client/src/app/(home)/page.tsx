import { products } from "@/data/mockData"
import HeroSection from "./_components/HeroSection"
import ProductCarousel from "./_components/ProductCarousel"
import SearchBar from "../../components/search/SearchBar"
import ComparePricesSection from "./_components/ComparePricesSection"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <main>
        <SearchBar
          className="mx-auto max-w-md md:max-w-2xl mb-5 mt-10"
          inputClassName="py-5"
          placeholder="Search for products, brands, or categories..."
        />
        <HeroSection />
        <ProductCarousel
          title="Best Sellers"
          description="Our most popular products based on sales"
          products={products}
        />
        <ProductCarousel
          title="Home Essentials"
          description="Everything you need for your home"
          products={products}
        />

        <ProductCarousel
          title="Computers & Accessories"
          description="Latest tech at competitive prices"
          products={products}
        />

        <ComparePricesSection />
      </main>
    </div>
  )
}
