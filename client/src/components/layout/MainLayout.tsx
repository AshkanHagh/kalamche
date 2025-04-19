"use client"

import { Toaster } from "sonner"

type MainLayoutProps = {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" />
    </>
  )
}
export default MainLayout
