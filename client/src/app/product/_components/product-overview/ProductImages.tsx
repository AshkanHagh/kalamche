import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import Image from "next/image"

type ProductImagesProps = {
  name: string
  images: string[]
}

const ProductImages = ({ images, name }: ProductImagesProps) => {
  return (
    <Carousel className="max-w-md mx-auto mb-7">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={image}
                alt={`${name} - Image ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
export default ProductImages
