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
import { Control, FieldPath } from "react-hook-form"
import { LucideIcon } from "lucide-react"

const ContactInfo = () => {
  const { control } = useFormContext<FormSchemaValues>()

  return (
    <div className="space-y-4">
      <ContactInput
        control={control}
        name="email"
        label="Email Address *"
        placeholder="shop@example.com"
        icon={Mail}
        required
      />
      <ContactInput
        control={control}
        name="phoneNumber"
        label="Phone Number *"
        placeholder="+1 (555) 123-4567"
        icon={Phone}
        required
      />
      <ContactInput
        control={control}
        name="website"
        label="Website"
        placeholder="https://yourwebsite.com"
        icon={Globe}
        description="Optional - Your business website or social media"
      />
    </div>
  )
}

type ContactInputProps = {
  control: Control<FormSchemaValues>
  name: FieldPath<FormSchemaValues>
  label: string
  placeholder: string
  icon: LucideIcon
  required?: boolean
  description?: string
}

const ContactInput = ({
  control,
  name,
  label,
  placeholder,
  icon: Icon,
  required,
  description
}: ContactInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field } }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={placeholder}
                className="pl-10 h-10"
                value={value as string | undefined}
                {...field}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ContactInfo
