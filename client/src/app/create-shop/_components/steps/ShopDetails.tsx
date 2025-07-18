"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormContext } from "react-hook-form"
import { FormSchemaValues } from "../../_schema/formSchema"

const ShopDetails = () => {
  const { control } = useFormContext<FormSchemaValues>()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">Shop Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your shop name"
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              Description *
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your shop and what makes it unique..."
                className="min-h-[80px] resize-none border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-500">
              {field.value?.length || 0}/500 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default ShopDetails
