import { Button } from "@/components/ui/button"
import Image from "next/image"

const ComparePricesSection = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="rounded-lg bg-muted p-8">
        <div className="grid gap-1 sm:gap-4 sm:grid-cols-2 lg:gap-8">
          <div>
            <h3 className="text-2xl font-bold">Compare Prices & Save</h3>
            <p className="mt-2 text-muted-foreground">
              We compare prices from hundreds of retailers so you always get the
              best deal.
            </p>
            <Button className="mt-4">Learn More</Button>
          </div>
          <div className="hidden items-center justify-center sm:flex">
            <Image
              src="/images/money.jpg"
              alt="Compare prices illustration"
              width={300}
              height={200}
              className="rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
export default ComparePricesSection
