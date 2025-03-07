type ProductDetailsProps = {
  name: string
  price: number
  description: string
}

const ProductDetails = ({ name, price, description }: ProductDetailsProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        <p className="mt-2 text-2xl font-semibold text-primary">
          ${price.toFixed(2)}
        </p>
      </div>

      <p className="text-muted-foreground text-balance p-2">{description}</p>
    </div>
  )
}
export default ProductDetails
