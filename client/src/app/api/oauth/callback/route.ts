import { Login } from "@/app/auth/_types"
import axios from "@/lib/api/axios"
import appendSetCookie from "@/lib/auth/appendSetCookie"
import {
  clearUserRoleToken,
  setUserRoleToken
} from "@/lib/auth/user-roles-cookie"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const provider = searchParams.get("provider")

  if (!code || !state || !provider) {
    return NextResponse.json({ message: "INVALID_QUERY" }, { status: 422 })
  }

  try {
    const backendResponse = await axios.get<Login>(
      `oauth/callback?code=${code}&state=${state}&provider=${provider}`
    )
    const userRoles = backendResponse.data.user.roles
    const nextResponse = NextResponse.json(backendResponse.data)

    const response = await setUserRoleToken(userRoles, nextResponse)
    return appendSetCookie(backendResponse, response)
  } catch (e) {
    const error = e as AxiosError<ServerError>

    const nextResponse = NextResponse.json(
      error.response?.data ?? { message: "Unexpected error" },
      {
        status: error.response?.status || 500
      }
    )

    if (error.response?.status === 401) {
      const response = clearUserRoleToken(nextResponse)
      return response
    }
    return nextResponse
  }
}
