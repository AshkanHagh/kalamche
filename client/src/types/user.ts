export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  wallet: Wallet
  roles: string[]
  createdAt: string
}

export type Wallet = {
  frTokens: number
  lastTransaction: LastTransaction | null
}

export type LastTransaction = {
  createdAt: string
  frTokens: number
}

export type UserDataResponse = {
  user: User
  success: boolean
}
