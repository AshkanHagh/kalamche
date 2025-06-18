export type ServerError = {
  success: boolean
  statusCode: number
  message: string
}

export type HandleApiErrorReturn = {
  errorMessage: string
  data?: ServerError
}

export type ServerStatusCode = 400 | 401 | 403 | 429 | 404 | 500
