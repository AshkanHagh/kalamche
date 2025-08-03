// API endpoints
export const API_ENDPOINTS = {
  auth: {
    oauth: {
      callback: "/oauth/callback"
    },
    token: {
      refresh: "/auth/refresh"
    },
    register: "/auth/register",
    login: "/auth/login",
    verify: {
      verifyCode: "/auth/verify",
      resend: "/auth/verify/resend"
    }
  },
  api: {
    users: {
      me: "api/users/me"
    }
  }
}
