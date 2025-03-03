import {
  bestSellingProducts,
  computersAndAccessories,
  homeEssentials
} from "@/data/mockData"
import HeroSection from "./_components/HeroSection"
import ProductCarousel from "./_components/ProductCarousel"
import SearchBar from "./_components/SearchBar"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <SearchBar />
        <HeroSection />
        <ProductCarousel
          title="Best Sellers"
          description="Our most popular products based on sales"
          products={bestSellingProducts}
        />
        <ProductCarousel
          title="Home Essentials"
          description="Everything you need for your home"
          products={homeEssentials}
        />

        <ProductCarousel
          title="Computers & Accessories"
          description="Latest tech at competitive prices"
          products={computersAndAccessories}
        />
      </main>
    </div>
  )
}
