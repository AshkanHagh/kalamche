import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Control } from "react-hook-form"
import Link from "next/link"

type TermsCheckboxProps = {
  control: Control<any>
}

export default function TermsCheckbox({ control }: TermsCheckboxProps) {
  return (
    <FormField
      control={control}
      name="terms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                privacy policy
              </Link>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
