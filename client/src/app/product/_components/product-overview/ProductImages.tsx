"use client"

import Image from "next/image"
import { Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

type ProductImagesProps = {
  name: string
  images: string[]
}

const ProductImages = ({ images, name }: ProductImagesProps) => {
  return (
    <>
      <Swiper
        slidesPerView="auto"
        pagination={{
          type: "fraction"
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="max-w-sm mx-auto w-full md:max-w-md"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="aspect-square md:min-w-[26rem]">
              <Image
                src={image}
                alt={`${name} - Image ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}
export default ProductImages
