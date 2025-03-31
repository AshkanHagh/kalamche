"use client"

import StoreProvider from "@/lib/redux/StoreProvider"
import { Toaster } from "sonner"

type MainLayoutProps = {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <StoreProvider>
      {children}
      <Toaster richColors position="top-center" />
    </StoreProvider>
  )
}
export default MainLayout
