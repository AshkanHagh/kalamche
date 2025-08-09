import "server-only"

import { AxiosResponse } from "axios"
import { NextResponse } from "next/server"

const appendSetCookie = (
  backendResponse: AxiosResponse,
  clientResponse: NextResponse
) => {
  const rawSetCookies = backendResponse.headers["set-cookie"]

  if (rawSetCookies) {
    for (const cookie of rawSetCookies) {
      clientResponse.headers.append("set-cookie", cookie)
    }
  }

  return clientResponse
}

export default appendSetCookie
