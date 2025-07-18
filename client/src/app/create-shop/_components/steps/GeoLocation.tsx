"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useFormContext } from "react-hook-form"
import { LOCATIONS_DATA } from "../../_constant/LOCATIONS_DATA"
import { useEffect } from "react"

const GeoLocation = () => {
  const { control, watch, resetField } = useFormContext()

  const selectedCountry = watch("country")
  const selectedState = watch("state")
  const selectedCity = watch("city")

  const states =
    LOCATIONS_DATA.find((c) => c.country === selectedCountry)?.states || []

  const cities = states.find((c) => c.name === selectedState)?.cities || []

  useEffect(() => {
    if (selectedState || selectedCity) {
      resetField("state")
      resetField("city")
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedState) {
      resetField("city")
    }
  }, [selectedState])

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">Country *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value)
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LOCATIONS_DATA.map(({ country }) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              State/Province *
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value)
              }}
              value={field.value}
              disabled={!selectedCountry}
            >
              <FormControl>
                <SelectTrigger className="h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.name} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">City *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedState}
            >
              <FormControl>
                <SelectTrigger className="h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default GeoLocation
