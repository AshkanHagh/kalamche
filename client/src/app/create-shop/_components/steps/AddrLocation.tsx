import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFormContext } from "react-hook-form"
import { FormSchemaValues } from "../../_schema/formSchema"

const AddrLocation = () => {
  const { control } = useFormContext<FormSchemaValues>()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="streetAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              Street Address *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="123 Main Street, Suite 100"
                className="h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              ZIP/Postal Code *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="12345"
                className="h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default AddrLocation
