"use client"

import StoreProvider from "@/lib/redux/StoreProvider"

type MainLayoutProps = {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <StoreProvider>{children}</StoreProvider>
}
export default MainLayout
