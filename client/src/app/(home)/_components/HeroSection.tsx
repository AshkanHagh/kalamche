import { Button } from "@/components/ui/button"
import Image from "next/image"

const HeroSection = () => {
  return (
    <section className="container py-6 md:py-8">
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-image.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 px-6 py-16 md:px-10 md:py-24 lg:py-32">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Compare Prices. Find Deals. Shop Smart.
            </h1>
            <p className="mx-auto max-w-[600px] text-white md:text-xl">
              Discover the best prices from multiple retailers in one place.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white transition-opacity hover:opacity-90"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default HeroSection
