"use client"

import { Button } from "@/components/ui/button"
import { Form, FormDescription } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { RegisterFormValues, registerSchema } from "../../_schema/formSchema"
import FormInput from "../../../../components/ui/FormInput"
import TermsCheckbox from "./TermsCheckbox"
import VerificationCodeModal from "../VerificationCodeModal/VerificationCodeModal"
import useRegister from "../../_service-hooks/useRegister"
import { AuthBody, VerificationResponse } from "../../_types"
import useManageVerification from "../../_hooks/useManageVerification"
import { handleApiError } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"
import { AxiosError } from "axios"
import { ServerError } from "@/types"

const RegisterForm = () => {
  const { register } = useRegister()
  const { isOpen, setIsOpen, onResend, onVerify } = useManageVerification()
  const [verificationToken, setVerificationToken] = useState<
    string | undefined
  >(undefined)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = form

  const onSubmit = async ({ email, password }: RegisterFormValues) => {
    const body: AuthBody = { email, password }

    const handleRegisterSuccess = async (data: VerificationResponse) => {
      const token = data.verificationToken
      setIsOpen(true)
      setVerificationToken(token)
    }
    const handleRegisterError = async (error: AxiosError<ServerError>) => {
      const { errorMessage } = handleApiError(error)
      toast.error(errorMessage)
    }

    await register(body, handleRegisterSuccess, handleRegisterError)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            control={control}
            label="Email"
            name="email"
            placeholder="name@example.com"
            type="email"
          />
          <div>
            <FormInput
              control={control}
              label="Password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
            <FormDescription>
              Password must be at least 8 characters and include uppercase,
              lowercase, and numbers.
            </FormDescription>
          </div>
          <FormInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            type="password"
          />
          <TermsCheckbox control={control} name="terms" />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Send Code"
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
export default RegisterForm
