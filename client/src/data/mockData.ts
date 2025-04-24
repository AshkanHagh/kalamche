import { Product, User } from "@/types"

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones",
    price: 249.99,
    originalPrice: 299.99,
    discount: 15,
    sellerName: "AudioTech",
    image: "https://i.imgur.com/jb5Yu0h.jpeg"
  },
  {
    id: "2",
    name: "Smart Fitness Tracker with Heart Rate Monitor",
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    sellerName: "FitGear",
    image: "https://i.imgur.com/UlxxXyG.jpeg"
  },
  {
    id: "3",
    name: "Portable Bluetooth Speaker Waterproof",
    price: 59.99,
    sellerName: "SoundWave",
    image: "https://i.imgur.com/R2PN9Wq.jpeg"
  },
  {
    id: "4",
    name: "Ultra HD 4K Smart TV 55-inch",
    price: 499.99,
    originalPrice: 649.99,
    discount: 20,
    sellerName: "VisionPlus",
    image: "https://i.imgur.com/IvxMPFr.jpeg"
  },
  {
    id: "5",
    name: "Robot Vacuum Cleaner with Mapping",
    price: 299.99,
    sellerName: "CleanTech",
    image: "https://i.imgur.com/7eW9nXP.jpeg"
  },
  {
    id: "6",
    name: "Professional Blender with Multiple Attachments",
    price: 129.99,
    originalPrice: 159.99,
    discount: 10,
    sellerName: "KitchenPro",
    image: "https://i.imgur.com/QkIa5tT.jpeg"
  },
  {
    id: "7",
    name: "Ultra HD 4K Smart TV 55-inch",
    price: 499.99,
    originalPrice: 649.99,
    discount: 20,
    sellerName: "VisionPlus",
    image: "https://i.imgur.com/UlxxXyG.jpeg"
  },
  {
    id: "8",
    name: "Robot Vacuum Cleaner with Mapping",
    price: 299.99,
    sellerName: "CleanTech",
    image: "https://i.imgur.com/jb5Yu0h.jpeg"
  },
  {
    id: "9",
    name: "Professional Blender with Multiple Attachments",
    price: 129.99,
    originalPrice: 159.99,
    discount: 10,
    sellerName: "KitchenPro",
    image: "https://i.imgur.com/IvxMPFr.jpeg"
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
