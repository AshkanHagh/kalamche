"use client"

import { Provider } from "react-redux"
import { makeStore } from "./store"

const StorProvider = ({ children }: { children: React.ReactNode }) => {
  const store = makeStore()

  return <Provider store={store}>{children}</Provider>
}
export default StorProvider
