import { Product, User } from "@/types"

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones",
    price: 249.99,
    originalPrice: 299.99,
    discount: 15,
    sellerName: "AudioTech",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  },
  {
    id: "2",
    name: "Smart Fitness Tracker with Heart Rate Monitor",
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    sellerName: "FitGear",
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
  },
  {
    id: "3",
    name: "Portable Bluetooth Speaker Waterproof",
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
    id: "7",
    name: "Ultra HD 4K Smart TV 55-inch",
    price: 499.99,
    originalPrice: 649.99,
    discount: 20,
    sellerName: "VisionPlus",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
  },
  {
    id: "8",
    name: "Robot Vacuum Cleaner with Mapping",
    price: 299.99,
    sellerName: "CleanTech",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    id: "9",
    name: "Professional Blender with Multiple Attachments",
    price: 129.99,
    originalPrice: 159.99,
    discount: 10,
    sellerName: "KitchenPro",
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
  }
]

export const user: User = {
  id: "user_123",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  roles: ["admin"],
  avatarUrl: "#",
  wallet: {
    frTokens: 1000,
    lastTransaction: { createdAt: "2025-04-03T12:39:51-0800", frTokens: 400 }
  },
  createdAt: "2010-03-05T07:03:51-0800"
}
