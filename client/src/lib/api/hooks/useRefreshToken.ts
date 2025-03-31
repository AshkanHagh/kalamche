import { useAppSelector } from "@/lib/redux/hooks/useRedux"
import axios from "../axios"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { logout, setCredentials } from "@/lib/redux/slices/authSlice"
import { handleApiError } from "@/lib/utils"
import { ServerError } from "@/types"
import { toast } from "sonner"

type RefreshTokenResponse = {
  success: boolean
  accessToken: string
}

const useRefreshToken = () => {
  const { auth } = useAppSelector((state) => state)
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const refresh = async (): Promise<string | undefined> => {
    try {
      const response = await axios.get<RefreshTokenResponse>("token/refresh")
      const newAccessToken = response.data.accessToken

      if (newAccessToken) {
        dispatch(setCredentials({ ...auth, accessToken: newAccessToken }))
        return newAccessToken
      }
    } catch (e) {
      const error = e as AxiosError<ServerError>
      const status = error.response?.status

      if (status === 400 || status === 401) {
        dispatch(logout())
        push("/auth/login")
        return
      }
      const { errorMessage } = handleApiError(error)
      toast.error(errorMessage)
    }
  }
  return refresh
}

export default useRefreshToken
