import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import LoginForm from "../_components/form/LoginForm"
import SocialAuthButtons from "../_components/SocialAuthButtons"

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen max-w-md mx-auto">
      <div className="flex w-full flex-col justify-center space-y-6  sm:shadow p-5 rounded">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <LoginForm />

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
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
