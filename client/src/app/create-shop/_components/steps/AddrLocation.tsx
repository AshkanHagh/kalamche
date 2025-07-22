import { useFormContext } from "react-hook-form"
import { FormSchemaValues } from "../../_schema/formSchema"
import FormInput from "@/components/ui/FormInput"

const AddrLocation = () => {
  const { control } = useFormContext<FormSchemaValues>()

  return (
    <div className="space-y-4">
      <FormInput
        control={control}
        label="Street Address *"
        name="streetAddress"
        placeholder="123 Main Street, Suite 100"
        className="h-10"
      />
      <FormInput
        control={control}
        label="ZIP/Postal Code *"
        name="zipCode"
        placeholder="12345"
        className="h-10"
      />
    </div>
  )
}
export default AddrLocation
