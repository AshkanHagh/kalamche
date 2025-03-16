export type CurrentUser = {
  id: string
  name: string
  email: string
  avatar: string
  subscription: Subscription
  memberSince: Date
}

export type Subscription = {
  status: "active" | "inactive"
  endDate?: Date
}
