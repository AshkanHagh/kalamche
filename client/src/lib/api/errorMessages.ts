import { ServerStatusCode } from "@/types"

export const errorMessages: Record<ServerStatusCode, Record<string, string>> = {
  404: {},
  400: {},
  401: {},
  403: {},
  429: {},
  500: {}
}

export const getErrorMessage = (
  status: ServerStatusCode | undefined,
  endpoint: string
) => {
  if (!status) return "Unexpected error"

  const statusErrors = errorMessages[status]
  if (!statusErrors) return "Unexpected error"

  const errorMessage: string | undefined = statusErrors[endpoint]
  if (!errorMessage) return "Unexpected error"

  return errorMessage
}
