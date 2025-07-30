import axios from "@/lib/api/axios"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const GET = async () => {
  const token = (await cookies()).get("access_token")?.value
  try {
    const response = await axios.get("users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return NextResponse.json(response.data)
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
