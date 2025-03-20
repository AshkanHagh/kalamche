"use client"

import StorProvider from "@/lib/StorProvider"

type MainLayoutProps = {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <StorProvider>{children}</StorProvider>
}
export default MainLayout
