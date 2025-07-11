import { useEffect, useState } from "react"
import useRefreshToken from "./useRefreshToken"
import useAxiosPrivate from "./useAxiosPrivate"
import { UserDataResponse } from "@/types"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/useRedux"
import { logout, setCredentials } from "@/lib/redux/slices/authSlice"
import { AxiosError } from "axios"
import { toast } from "sonner"

const useInitUser = () => {
  const user = useAppSelector((state) => state.auth.user)
  const needsUserInit = user === undefined

  const dispatch = useAppDispatch()
  const refresh = useRefreshToken()
  const privateAxios = useAxiosPrivate()
  const [isLoading, setIsLoading] = useState<boolean>(needsUserInit)

  const fetchData = async () => {
    setIsLoading(true)
    const newAccessToken = await refresh({
      redirectOnFail: false,
      silent: true
    })
    if (!newAccessToken) {
      setIsLoading(false)
      dispatch(logout())
      return
    }

    try {
      const { data } = await privateAxios.get<UserDataResponse>("user/me", {
        headers: { Authorization: `Bearer ${newAccessToken}` }
      })

      dispatch(setCredentials({ user: data.user, accessToken: newAccessToken }))
    } catch (e) {
      const error = e as AxiosError
      toast.error(
        `failed to load your data! - status ${error.response?.status}`
      )
      dispatch(logout())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!needsUserInit) return
    fetchData()
  }, [needsUserInit])

  return { isLoading }
}
export default useInitUser
