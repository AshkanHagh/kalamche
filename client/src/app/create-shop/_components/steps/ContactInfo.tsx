import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Globe, Mail, Phone } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { FormSchemaValues } from "../../_schema/formSchema"

const ContactInfo = () => {
  const { control } = useFormContext<FormSchemaValues>()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              Email Address *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="shop@example.com"
                  className="pl-10 h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              Phone Number *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="+1 (555) 123-4567"
                  className="pl-10 h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">Website</FormLabel>
            <FormControl>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="https://yourwebsite.com"
                  className="pl-10 h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs text-gray-500">
              Optional - Your business website or social media
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default ContactInfo
