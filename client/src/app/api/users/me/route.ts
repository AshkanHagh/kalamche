import axios from "@/lib/api/axios"
import {
  clearUserRoleToken,
  setUserRoleToken
} from "@/lib/auth/user-roles-cookie"
import { ServerError, User } from "@/types"
import { AxiosError } from "axios"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  const accessToken = req.headers.get("Authorization")
  if (!accessToken) {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const { data } = await axios.get<User>("users/me", {
      headers: { Authorization: accessToken }
    })
    const userRoles = data.roles
    const nextResponse = NextResponse.json(data)

    const response = await setUserRoleToken(userRoles, nextResponse)
    return response
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
