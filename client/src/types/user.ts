export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  wallet: Wallet
  permissions: string[]
  createdAt: string
}

export type Wallet = {
  frTokens: number
  lastTransaction: LastTransaction
}

export type LastTransaction = {
  createdAt: string
  frTokens: number
}
