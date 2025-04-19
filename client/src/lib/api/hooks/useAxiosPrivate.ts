import { useAppSelector } from "@/lib/redux/hooks/useRedux"
import { axiosPrivate } from "../axios"
import { AxiosError, AxiosRequestConfig } from "axios"
import useRefreshToken from "./useRefreshToken"
import { useEffect } from "react"

const useAxiosPrivate = () => {
  const { accessToken } = useAppSelector((state) => state.auth)
  const refresh = useRefreshToken()

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use((config) => {
      if (accessToken && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${accessToken}`
      }
      return config
    })

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => {
        return response
      },
      async (e) => {
        const error = e as AxiosError
        const prevRequest = error.config as AxiosRequestConfig & {
          sent: boolean
        }

        if (error.response?.status !== 401 || prevRequest.sent) {
          return Promise.reject(error)
        }

        prevRequest.sent = true
        const newAccessToken = await refresh()

        if (prevRequest.headers && accessToken) {
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
          return axiosPrivate(prevRequest)
        }
      }
    )

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept)
      axiosPrivate.interceptors.response.eject(responseIntercept)
    }
  }, [accessToken, refresh])

  return axiosPrivate
}

export default useAxiosPrivate
