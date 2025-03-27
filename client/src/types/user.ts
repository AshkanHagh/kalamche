export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  subscription: Subscription
  permissions: string[]
  createdAt: string
}

export type Subscription = {
  status: "active" | "inactive"
  endDate?: string
}
