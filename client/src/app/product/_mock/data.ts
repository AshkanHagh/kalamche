import { ProductDetails } from "../_types"

export const product: ProductDetails = {
  id: "123123",
  name: "Premium Wireless Headphones",
  price: 199.99,
  description:
    "Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise-cancellation technology and long-lasting battery life.",
  likes: 1280,
  views: 2340,
  images: [
    "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
    "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg"
  ],
  seller: {
    name: "AudioTech",
    rating: 4.8
  },
  priceHistory: [
    { month: "January", price: 186 },
    { month: "February", price: 305 },
    { month: "March", price: 237 },
    { month: "April", price: 73 },
    { month: "May", price: 209 },
    { month: "June", price: 214 }
  ],
  specifications: [
    { label: "Brand", value: "AudioTech" },
    { label: "Model", value: "AT-2000" },
    { label: "Color", value: "Midnight Black" },
    { label: "Connectivity", value: "Bluetooth 5.0" },
    { label: "Battery Life", value: "Up to 30 hours" },
    { label: "Noise Cancellation", value: "Active" },
    { label: "Weight", value: "250g" },
    { label: "Warranty", value: "2 years" }
  ],

  otherSellers: [
    {
      id: "1",
      name: "ElectroHub",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.5,
      price: 204.99,
      description: "Free shipping on orders over $200"
    },
    {
      id: "2",
      name: "SoundMasters",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.7,
      price: 199.99,
      description:
        "Includes 3-month subscription to premium music streaming service"
    },
    {
      id: "3",
      name: "TechDeals",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.3,
      price: 194.99,
      description: "Extended 3-year warranty available"
    },
    {
      id: "4",
      name: "AudioPhiles",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.6,
      price: 209.99,
      description: "Includes premium carry case"
    },
    {
      id: "5",
      name: "GadgetWorld",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.4,
      price: 197.99,
      description: "30-day money-back guarantee"
    },
    {
      id: "6",
      name: "MusicMart",
      logo: "https://yt3.googleusercontent.com/ytc/AIdro_n3imu9phINHcHMX98dOj0gDrk8zpUUkiNoS8-tEL8dGQ=s160-c-k-c0x00ffffff-no-rj",
      rating: 4.2,
      price: 189.99,
      description: "Refurbished - Excellent condition"
    }
  ],
  relatedProducts: [
    {
      id: "3",
      name: "Portable Bluetooth",
      price: 59.99,
      sellerName: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: "4",
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      sellerName: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: "5",
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      sellerName: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: "6",
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      sellerName: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: "1324",
      name: "Portable Bluetooth Speaker Waterproof",
      price: 59.99,
      sellerName: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: "1532532",
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      sellerName: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: "123413521325",
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      sellerName: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: "123512351235",
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      sellerName: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: "123412351235",
      name: "Portable Bluetooth Speaker Waterproof",
      price: 59.99,
      sellerName: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: "1234123415",
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      sellerName: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: "123512342134",
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      sellerName: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: "123512345235",
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      sellerName: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    }
  ]
}
