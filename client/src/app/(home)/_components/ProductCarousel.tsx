"use client"

import ProductCard from "@/components/product/ProductCard"
import type { Product } from "@/types"
import { Swiper, SwiperSlide, useSwiper } from "swiper/react"
import { Navigation } from "swiper/modules"
import "swiper/css"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

type ProductCarouselProps = {
  title: string
  description: string
  products: Product[]
}

const ProductCarousel = ({
  title,
  description,
  products
}: ProductCarouselProps) => {
  const slideWidth = 240

  return (
    <section className="w-full my-10">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Link href="#" className="text-primary hover:underline self-end">
          more..
        </Link>
      </div>
      <Swiper
        slidesPerView="auto"
        spaceBetween={20}
        modules={[Navigation]}
        className="relative cursor-grab h-product-carousel"
      >
        {products.map((product) => (
          <SwiperSlide
            key={product.id}
            className="h-full"
            style={{ width: slideWidth }}
          >
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
        <SwiperSlideButtons />
      </Swiper>
    </section>
  )
}

export default ProductCarousel

const SwiperSlideButtons = () => {
  const swiper = useSwiper()
  return (
    <>
      <Button
        onClick={() => swiper.slideNext()}
        variant="outline"
        className="absolute top-1/2 bg-background/80 z-10 right-1 p-1 px-3 shadow-lg"
      >
        <ChevronRight className="text-foreground" />
      </Button>
      <Button
        onClick={() => swiper.slidePrev()}
        variant="outline"
        className="absolute top-1/2 bg-background/80 z-10 left-1 p-1 px-3 shadow-lg"
      >
        <ChevronLeft className="text-foreground" />
      </Button>
    </>
  )
}
