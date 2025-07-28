import "server-only"

import { SignJWT } from "jose"
import { cookies } from "next/headers"

export const storeUserRoleToken = async (roles: string[]) => {
  const token = await new SignJWT({ roles: roles })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

  ;(await cookies()).set("roles", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production"
  })
}
