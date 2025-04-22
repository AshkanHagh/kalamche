"use client"

import useInitUser from "@/lib/api/hooks/useInitUser"

type InitUserLayoutProps = {
  children: React.ReactNode
  loadingElement?: React.ReactNode | string
}

const InitUserLayout = ({ children, loadingElement }: InitUserLayoutProps) => {
  const { isLoading } = useInitUser()

  if (isLoading && loadingElement) {
    return loadingElement
  }

  return <>{children}</>
}
export default InitUserLayout
