import "server-only"

import { jwtVerify, SignJWT } from "jose"
import { NextResponse } from "next/server"

export const setUserRoleToken = async (roles: string[], res: NextResponse) => {
  const token = await new SignJWT({ roles })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

  res.cookies.set("roles", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production"
  })
  return res
}

export const clearUserRoleToken = (res: NextResponse) => {
  res.cookies.set("roles", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production"
  })
  return res
}

export const getUserRoles = async (
  res: NextResponse
): Promise<string[] | null> => {
  try {
    const token = res.cookies.get("roles")?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify<{ roles: string[] }>(token, secret)

    return payload.roles || null
  } catch (err) {
    console.error("Invalid or expired JWT:", err)
    return null
  }
}
