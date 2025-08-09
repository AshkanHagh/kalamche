import { AuthBody, LoginResponse } from "@/app/auth/_types"
import axios from "@/lib/api/axios"
import appendSetCookie from "@/lib/auth/appendSetCookie"
import { setUserRoleToken } from "@/lib/auth/user-roles-cookie"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: NextRequest) => {
  const body: AuthBody = await req.json()
  try {
    const backendResponse = await axios.post<LoginResponse>("/auth/login", body)
    const { data } = backendResponse
    const nextResponse = NextResponse.json(data)
    if (data.verifyEmailSent) return nextResponse

    const userRoles = data.user.roles

    const response = await setUserRoleToken(userRoles, nextResponse)
    return appendSetCookie(backendResponse, response)
  } catch (e) {
    const error = e as AxiosError<ServerError>

    return NextResponse.json(
      error.response?.data ?? { message: "Unexpected error" },
      {
        status: error.response?.status || 500
      }
    )
  }
}
