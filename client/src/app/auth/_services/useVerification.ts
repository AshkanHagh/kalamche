import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { Login, VerificationResponse, VerifyCodeBody } from "../_types"
import useVerifyCode from "./useVerifyCode"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { AxiosError } from "axios"
import { ServerError } from "@/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { handleApiError } from "@/lib/utils"
import { useCallback, useState } from "react"
import useResendCode from "./useResendCode"

const useVerification = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [newVerificationToken, setNewVerificationToken] = useState<
    string | null
  >(null)
  const { verifyCode } = useVerifyCode()
  const { resendCode } = useResendCode()
  const dispatch = useAppDispatch()
  const { replace } = useRouter()

  const handleVerifyCodeSuccess = useCallback(
    ({ accessToken, user }: Login) => {
      dispatch(setCredentials({ accessToken: accessToken, user: user }))
      setIsOpen(false)
      toast.success("Verify successful.")
      replace("/")
    },
    [dispatch, replace]
  )

  const handleResendCodeSuccess = useCallback(
    (data: VerificationResponse, email: string) => {
      const newToken = data.verificationToken
      setNewVerificationToken(newToken)
      toast.success(
        `Email has seA new verification code has been sent to ${email}`
      )
    },
    []
  )

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
    await resendCode(
      email,
      (data) => handleResendCodeSuccess(data, email),
      handleError
    )
  }

  return { isOpen, setIsOpen, onVerify, onResend }
}
export default useVerification
