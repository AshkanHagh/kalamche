import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { Login, VerificationResponse, VerifyCodeBody } from "../_types"
import useVerifyCode from "../_services/useVerifyCode"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { AxiosError } from "axios"
import { ServerError } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { handleApiError } from "@/lib/utils"
import { useCallback, useState } from "react"
import useResendCode from "../_services/useResendCode"

const useManageVerification = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [newVerificationToken, setNewVerificationToken] = useState<
    string | null
  >(null)
  const { verifyCode } = useVerifyCode()
  const { resendCode } = useResendCode()
  const dispatch = useAppDispatch()
  const { replace } = useRouter()

  const handleError = useCallback((error: AxiosError<ServerError>) => {
    const { errorMessage } = handleApiError(error)
    toast.error(errorMessage)
  }, [])

  const onVerify = async ({
    code,
    token
  }: Omit<VerifyCodeBody, "token"> & { token: string | undefined }) => {
    if (!token) {
      toast.error("invalid verification token!")
      return
    }

    const handleVerifyCodeSuccess = ({ accessToken, user }: Login) => {
      dispatch(setCredentials({ accessToken: accessToken, user: user }))
      setIsOpen((prev) => !prev)
      toast.success("Verify successful.")
      replace("/")
    }

    const verificationToken = newVerificationToken
      ? newVerificationToken
      : token
    await verifyCode(
      { code, token: verificationToken },
      handleVerifyCodeSuccess,
      handleError
    )
  }

  const onResend = async (email: string) => {
    const handleResendCodeSuccess = (data: VerificationResponse) => {
      const newToken = data.verificationToken
      setNewVerificationToken(newToken)
      toast.success(`New verification code has been sent to ${email}`)
    }

    await resendCode(email, handleResendCodeSuccess, handleError)
  }

  return { isOpen, setIsOpen, onVerify, onResend }
}
export default useManageVerification
