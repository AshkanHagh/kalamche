import { useEffect, useState } from "react"
import useRefreshToken from "./useRefreshToken"
import useAxiosPrivate from "./useAxiosPrivate"
import { UserDataResponse } from "@/types"
import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { AxiosError } from "axios"
import { toast } from "sonner"

const useInitUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const dispatch = useAppDispatch()
  const refresh = useRefreshToken()
  const privateAxios = useAxiosPrivate()

  const fetchData = async () => {
    setIsLoading(true)
    const newAccessToken = await refresh({
      redirectOnFail: false,
      silent: true
    })
    if (!newAccessToken) {
      setIsLoading(false)
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { isLoading }
}
export default useInitUser
