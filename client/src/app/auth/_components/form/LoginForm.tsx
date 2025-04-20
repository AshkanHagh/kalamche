"use client"

import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import FormInput from "./FormInput"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormValues, loginSchema } from "../../_schema/formSchema"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AuthBody, LoginResponse } from "../../_types"
import useLogin from "../../_service-hooks/useLogin"
import { toast } from "sonner"
import { handleApiError } from "@/lib/utils"
import RememberMeCheckbox from "./RememberMeCheckbox"
import VerificationCodeModal from "../VerificationCodeModal/VerificationCodeModal"
import useManageVerification from "../../_hooks/useManageVerification"
import { useState } from "react"
import { AxiosError } from "axios"
import { ServerError } from "@/types"
import { useAppDispatch } from "@/lib/redux/hooks/useRedux"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"

const LoginForm = () => {
  const { login } = useLogin()
  const { isOpen, onResend, onVerify, setIsOpen } = useManageVerification()
  const [verificationToken, setVerificationToken] = useState<
    string | undefined
  >(undefined)
  const dispatch = useAppDispatch()
  const { replace } = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })
  const {
    control,
    formState: { isSubmitting }
  } = form

  const onSubmit = async (data: LoginFormValues) => {
    const body: AuthBody = { email: data.email, password: data.password }

    const handleLoginSuccess = (data: LoginResponse) => {
      if (data.verifyEmailSent) {
        setIsOpen(true)
        setVerificationToken(data.verificationToken)
        return
      }

      const { user, accessToken } = data
      dispatch(setCredentials({ user, accessToken }))
      toast.success("Login successfully!")
      replace("/")
    }

    const handleLoginError = (error: AxiosError<ServerError>) => {
      const { errorMessage } = handleApiError(error)
      toast.error(errorMessage)
    }

    await login(body, handleLoginSuccess, handleLoginError)
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Email"
            name="email"
            control={control}
            placeholder="name@example.com"
            type="email"
          />
          <FormInput
            label="Password"
            name="password"
            control={control}
            placeholder="••••••••"
            type="password"
          />
          <RememberMeCheckbox control={control} name="rememberMe" />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "login"
            )}
          </Button>
          {verificationToken && (
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="w-full"
              >
                Enter Code
              </Button>
            </div>
          )}
        </form>
      </Form>
      <VerificationCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onResend={() => onResend(form.getValues("email"))}
        onVerify={(code) => onVerify({ code, token: verificationToken })}
        codeLength={6}
        email={form.getValues("email")}
      />
    </>
  )
}

export default LoginForm
