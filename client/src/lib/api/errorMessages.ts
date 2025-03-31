import { ServerStatusCode } from "@/types"

export const errorMessages: Record<ServerStatusCode, Record<string, string>> = {
  404: {},
  400: {},
  401: {},
  403: {},
  429: {},
  500: {}
}

export const getErrorMessage = (status: ServerStatusCode, endpoint: string) => {
  const errorMessage: string | undefined = errorMessages[status][endpoint]
  if (!errorMessage) return "Unexpected error"

  return errorMessage
}
