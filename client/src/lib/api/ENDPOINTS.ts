// API endpoints
export const API_ENDPOINTS = {
  auth: {
    oauth: {
      login: "/auth/oauth",
      callback: "/auth/oauth/callback"
    },
    token: {
      refresh: "/auth/token/refresh"
    },
    register: "/auth/register",
    login: "/auth/login",
    verify: {
      verifyCode: "/auth/verify",
      resend: "/auth/verify/resend"
    }
  }
}
