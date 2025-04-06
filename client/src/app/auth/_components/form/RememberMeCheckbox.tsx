import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import Link from "next/link"
import { Control, FieldValues, Path } from "react-hook-form"

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
        href="#"
        className="text-sm font-medium text-primary hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  )
}

export default RememberMeCheckbox
