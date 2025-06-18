import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getErrorMessage } from "./api/errorMessages"
import { AxiosError } from "axios"
import { HandleApiErrorReturn, ServerError, ServerStatusCode } from "@/types"
import { formatDistanceToNowStrict } from "date-fns"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const extractNameLetters = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export const handleApiError = (
  error: AxiosError<ServerError>
): HandleApiErrorReturn => {
  let endpoint = error.config!.url!
  const errorData: HandleApiErrorReturn = {
    errorMessage: "Unexpected error"
  }
  if (endpoint.startsWith("/")) endpoint = endpoint.substring(1)

  if (error.response) {
    // The request was made and the server responded with a status code
    const { status, data } = error.response
    const statusCode = status as ServerStatusCode
    errorData.data = data
    errorData.errorMessage = getErrorMessage(statusCode, endpoint)
  } else if (error.request) {
    // The request was made but no response was received
    errorData.errorMessage =
      "No response received from the server. Please check your internet connection."
  }
  return errorData
}

export const timeAgo = (date: string) => {
  if (!date) return "Invalid date"

  return formatDistanceToNowStrict(new Date(date), { addSuffix: true })
}

export const openBrowserPopup = (
  url: string,
  { width = 600, height = 600, windowName = "popup" } = {}
) => {
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "resizable",
    "scrollbars=yes"
  ].join(",")

  return window.open(url, windowName, features)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}
