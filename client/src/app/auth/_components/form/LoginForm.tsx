"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import { Control, useForm, FieldValues, Path } from "react-hook-form"
import FormInput from "./FormInput"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormValues, loginSchema } from "../../_schema/formSchema"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const LoginForm = () => {
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

  const onSubmit = (data: LoginFormValues) => {
    console.log(data)
  }
  return (
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
      </form>
    </Form>
  )
}

type RememberMeCheckboxProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
}

const RememberMeCheckbox = <T extends FieldValues>({
  control,
  name
}: RememberMeCheckboxProps<T>) => {
  return (
    <div className="flex items-center justify-between">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
            </div>
          </FormItem>
        )}
      />
      <Link
        href="/forgot-password"
        className="text-sm font-medium text-primary hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  )
}

export default LoginForm
