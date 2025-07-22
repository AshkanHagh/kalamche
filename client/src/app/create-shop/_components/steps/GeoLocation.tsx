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
import { useEffect, useMemo, useRef } from "react"
import { FormSchemaValues } from "../../_schema/formSchema"
import type { Control } from "react-hook-form"

type ControlType = Control<FormSchemaValues>

const GeoLocation = () => {
  const { control, watch, resetField } = useFormContext<FormSchemaValues>()
  const firstLoad = useRef<boolean>(true)

  console.log(firstLoad)

  const [selectedCountry, selectedState, selectedCity] = watch([
    "country",
    "state",
    "city"
  ])

  const states = useMemo(
    () =>
      LOCATIONS_DATA.find((c) => c.country === selectedCountry)?.states || [],
    [selectedCountry]
  )
  const cities = useMemo(
    () => states.find((c) => c.name === selectedState)?.cities || [],
    [selectedState, states]
  )

  useEffect(() => {
    if (!firstLoad.current && (selectedState || selectedCity)) {
      resetField("state")
      resetField("city")
    }
  }, [selectedCountry])

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (selectedState) {
      resetField("city")
    }
  }, [selectedState])

  return (
    <div className="space-y-4">
      <GeoLocationSelect
        control={control}
        title="Country"
        name="country"
        placeholder="Select Country"
      >
        {LOCATIONS_DATA.map(({ country }) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </GeoLocationSelect>

      <GeoLocationSelect
        control={control}
        title="State/Province"
        disabled={!selectedCountry}
        name="state"
        placeholder="Select State"
      >
        {states.map((state) => (
          <SelectItem key={state.name} value={state.name}>
            {state.name}
          </SelectItem>
        ))}
      </GeoLocationSelect>

      <GeoLocationSelect
        control={control}
        title="City"
        disabled={!selectedState}
        name="city"
        placeholder="Select City"
      >
        {cities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </GeoLocationSelect>
    </div>
  )
}

// GeoLocationSelect Component Section
type GeoLocationSelectProps = {
  control: ControlType
  title?: string
  disabled?: boolean
  children: React.ReactNode
  name: keyof FormSchemaValues
  placeholder: string
}
const GeoLocationSelect = ({
  control,
  title,
  name,
  disabled,
  children,
  placeholder
}: GeoLocationSelectProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold">{title}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value)
            }}
            disabled={disabled}
            value={field.value as string | undefined}
          >
            <FormControl>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default GeoLocation
