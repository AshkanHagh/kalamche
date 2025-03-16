import { CurrentUser } from "@/types"

export const bestSellingProducts = [
  {
    id: 1,
    name: "Wireless Noise Cancelling Headphones",
    price: 249.99,
    originalPrice: 299.99,
    discount: 15,
    seller: "AudioTech",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  },
  {
    id: 2,
    name: "Smart Fitness Tracker with Heart Rate Monitor",
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    seller: "FitGear",
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
  },
  {
    id: 3,
    name: "Portable Bluetooth Speaker Waterproof",
    price: 59.99,
    seller: "SoundWave",
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
  },
  {
    id: 4,
    name: "Ultra HD 4K Smart TV 55-inch",
    price: 499.99,
    originalPrice: 649.99,
    discount: 20,
    seller: "VisionPlus",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
  },
  {
    id: 5,
    name: "Robot Vacuum Cleaner with Mapping",
    price: 299.99,
    seller: "CleanTech",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    id: 6,
    name: "Professional Blender with Multiple Attachments",
    price: 129.99,
    originalPrice: 159.99,
    discount: 10,
    seller: "KitchenPro",
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
  }
]

export const homeEssentials = [
  {
    id: 7,
    name: "Memory Foam Mattress Queen Size",
    price: 399.99,
    originalPrice: 599.99,
    discount: 30,
    seller: "SleepWell",
    image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    id: 8,
    name: "Stainless Steel Cookware Set 10-Piece",
    price: 149.99,
    seller: "ChefChoice",
    image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    id: 9,
    name: "Smart Home Security Camera System",
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    seller: "SecureHome",
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg"
  },
  {
    id: 10,
    name: "Air Purifier with HEPA Filter",
    price: 129.99,
    seller: "PureAir",
    image:
      "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"
  },
  {
    id: 11,
    name: "Adjustable Standing Desk",
    price: 279.99,
    originalPrice: 349.99,
    discount: 15,
    seller: "ErgoWorks",
    image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg"
  },
  {
    id: 12,
    name: "Cordless Stick Vacuum Cleaner",
    price: 179.99,
    seller: "CleanHome",
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg"
  }
]

export const computersAndAccessories = [
  {
    id: 13,
    name: 'Ultra-Thin Laptop 15.6" 16GB RAM 512GB SSD',
    price: 899.99,
    originalPrice: 1099.99,
    discount: 15,
    seller: "TechPro",
    image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg"
  },
  {
    id: 14,
    name: "Mechanical Gaming Keyboard RGB Backlit",
    price: 79.99,
    seller: "GameGear",
    image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg"
  },
  {
    id: 15,
    name: "Wireless Gaming Mouse with Programmable Buttons",
    price: 49.99,
    originalPrice: 69.99,
    discount: 25,
    seller: "GameGear",
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg"
  },
  {
    id: 16,
    name: "27-inch 4K Monitor IPS Panel",
    price: 349.99,
    seller: "VisualTech",
    image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg"
  },
  {
    id: 17,
    name: "External SSD 1TB USB-C",
    price: 129.99,
    originalPrice: 159.99,
    discount: 10,
    seller: "DataStore",
    image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg"
  },
  {
    id: 18,
    name: "Wireless Charging Pad for Smartphones",
    price: 29.99,
    seller: "PowerUp",
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg"
  }
]

export const product = {
  id: 1,
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
      id: 3,
      name: "Portable Bluetooth",
      price: 59.99,
      seller: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: 4,
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      seller: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: 5,
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      seller: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: 6,
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      seller: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: 1324,
      name: "Portable Bluetooth Speaker Waterproof",
      price: 59.99,
      seller: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: 1532532,
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      seller: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: 123413521325,
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      seller: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: 123512351235,
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      seller: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: 123412351235,
      name: "Portable Bluetooth Speaker Waterproof",
      price: 59.99,
      seller: "SoundWave",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
    },
    {
      id: 1234123415,
      name: "Ultra HD 4K Smart TV 55-inch",
      price: 499.99,
      originalPrice: 649.99,
      discount: 20,
      seller: "VisionPlus",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
    },
    {
      id: 123512342134,
      name: "Robot Vacuum Cleaner with Mapping",
      price: 299.99,
      seller: "CleanTech",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
    },
    {
      id: 123512345235,
      name: "Professional Blender with Multiple Attachments",
      price: 129.99,
      originalPrice: 159.99,
      discount: 10,
      seller: "KitchenPro",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
    }
  ]
}

export const currentUser: CurrentUser = {
  id: "user_123",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  avatar: "#",
  subscription: {
    status: "active" as const,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 700) // 30 days from now
  },
  memberSince: new Date("2024-04-05")
}
