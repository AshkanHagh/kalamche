import { products } from "@/data/mockData"
import HeroSection from "./_components/HeroSection"
import ProductCarousel from "./_components/ProductCarousel"
import ComparePricesSection from "./_components/ComparePricesSection"
import SearchBar from "./_components/SearchBar"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <main>
        <SearchBar />
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
