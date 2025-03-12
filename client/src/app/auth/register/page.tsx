import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import RegisterForm from "../_components/form/RegisterForm"
import SocialAuthButtons from "../_components/SocialAuthButtons"

const RegisterPage = () => {
  return (
    <div className="flex justify-center items-center max-w-md mx-auto py-1 h-screen">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:shadow p-5 rounded">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>
        <RegisterForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <SocialAuthButtons />

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
