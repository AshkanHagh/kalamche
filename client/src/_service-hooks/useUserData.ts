import { ServerError, User } from "@/types"
import { AxiosError } from "axios"
import { API_ENDPOINTS } from "@/lib/api/ENDPOINTS"
import useAxiosPrivate from "@/lib/api/hooks/useAxiosPrivate"

type OnSuccess = (data: User) => void
type OnError = (error: AxiosError<ServerError>) => void

const useUserData = () => {
  const privateAxios = useAxiosPrivate()
  const getUserData = async (
    accessToken?: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    try {
      const { data } = await privateAxios.get<User>(
        API_ENDPOINTS.api.users.me,
        { baseURL: "/", headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (onSuccess) onSuccess(data)
    } catch (e) {
      const error = e as AxiosError<ServerError>
      if (onError) onError(error)
    } finally {
    }
  }
  return { getUserData }
}
export default useUserData
