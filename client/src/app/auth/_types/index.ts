import { User } from "@/types"

export type VerificationResponse = {
  success: boolean
  verificationToken: string
}

export type RegisterBody = {
  email: string
  password: string
}

export type Login = {
  success: boolean
  accessToken: string
  user: User
}

export type VerifyCodeBody = {
  code: number
  token: string
}
