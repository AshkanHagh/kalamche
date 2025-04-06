import { User } from "@/types"

export type AuthBody = {
  email: string
  password: string
}

export type Login = {
  success: boolean
  accessToken: string
  user: User
}
export type VerificationResponse = {
  success: boolean
  verificationToken: string
}
export type VerifyCodeBody = {
  code: number
  token: string
}

type LoginPendingResponse = {
  verifyEmailSent: true
} & VerificationResponse

type LoginVerifiedResponse = {
  verifyEmailSent: false
} & Login

export type LoginResponse = LoginPendingResponse | LoginVerifiedResponse
