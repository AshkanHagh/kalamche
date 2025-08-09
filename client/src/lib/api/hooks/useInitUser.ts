import { useEffect, useState } from "react"
import useRefreshToken from "./useRefreshToken"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks/useRedux"
import { logout, setCredentials } from "@/lib/redux/slices/authSlice"
import { toast } from "sonner"
import useUserData from "@/_service-hooks/useUserData"

const useInitUser = () => {
  const user = useAppSelector((state) => state.auth.user)
  const { getUserData } = useUserData()
  const needsUserInit = user === undefined

  const dispatch = useAppDispatch()
  const refresh = useRefreshToken()
  const [isLoading, setIsLoading] = useState<boolean>(needsUserInit)

  const fetchData = async () => {
    setIsLoading(true)

    // Get New Access Token
    const newAccessToken = await refresh({
      redirectOnFail: false,
      silent: true
    })
    if (!newAccessToken) {
      setIsLoading(false)
      dispatch(logout())
      return
    }

    // Get User Data With New Access Token
    await getUserData(
      newAccessToken,
      (data) => {
        dispatch(setCredentials({ user: data, accessToken: newAccessToken }))
      },
      (error) => {
        toast.error(
          `Failed to load your data! - status ${error.response?.status}`
        )
        dispatch(logout())
      }
    )
    setIsLoading(false)
  }

  useEffect(() => {
    if (!needsUserInit) return
    fetchData()
  }, [needsUserInit])

  return { isLoading }
}
export default useInitUser
