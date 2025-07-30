import { useAppSelector } from "@/lib/redux/hooks/useRedux"
import axios from "../axios"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { logout, setCredentials } from "@/lib/redux/slices/authSlice"
import { handleApiError } from "@/lib/utils"
import { ServerError, User } from "@/types"
import { toast } from "sonner"
import { API_ENDPOINTS } from "../ENDPOINTS"

type RefreshTokenResponse = {
  success: boolean
  accessToken: string
}

type RefreshOptions = {
  redirectOnFail?: boolean
  silent?: boolean
}

const useRefreshToken = () => {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const refresh = async (
    options: RefreshOptions = { redirectOnFail: true, silent: false }
  ): Promise<string | undefined> => {
    try {
      const response = await axios.get<RefreshTokenResponse>(
        API_ENDPOINTS.auth.token.refresh
      )
      const newAccessToken = response.data.accessToken

      if (newAccessToken) {
        dispatch(
          setCredentials({
            ...auth,
            user: auth.user as User,
            accessToken: newAccessToken
          })
        )
        return newAccessToken
      }
    } catch (e) {
      const error = e as AxiosError<ServerError>
      const status = error.response?.status

      if (status === 400 || status === 401) {
        if (options.redirectOnFail) {
          dispatch(logout())
          push("/auth/login")
          return
        }
      }

      if (!options.silent) {
        const { errorMessage } = handleApiError(error)
        toast.error(errorMessage)
      }
    }
  }
  return refresh
}

export default useRefreshToken
