export type Cookie = {
  expires: Date;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
};

export function buildCookie(): Cookie {
  return {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  };
}
