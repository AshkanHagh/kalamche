// API endpoints
export const API_ENDPOINTS = {
  oauth: {
    authorize: "/oauth"
  },
  auth: {
    token: {
      refresh: "/auth/refresh"
    },
    register: "/auth/register",
    verify: {
      resend: "/auth/verify/resend"
    }
  },

  // Internal API
  api: {
    users: {
      me: "/api/users/me"
    },
    auth: {
      verify: "/api/auth/verify",
      login: "/api/auth/login",
      oauth: {
        callback: "/api/oauth/callback"
      }
    }
  }
}
