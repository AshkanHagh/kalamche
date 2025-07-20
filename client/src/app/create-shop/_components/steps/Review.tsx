"use client"

import { Button } from "@/components/ui/button"
import { Check, Edit, Globe, Mail, MapPin, Phone, Store } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { FormSchemaValues } from "../../_schema/formSchema"
import Image from "next/image"
import { MouseEvent } from "react"
import { useMultiStepContext } from "@/lib/context/MultiStepContext"

const Review = () => {
  const { getValues } = useFormContext<FormSchemaValues>()
  const { goTo } = useMultiStepContext()

  const formValues = getValues()

  const logoPreview = URL.createObjectURL(formValues.logo)

  return (
    <div className="space-y-4 text-sm">
      <div className="text-center my-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-base font-semibold mb-1">
          Review Your Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          Confirm details before submitting
        </p>
      </div>

      <div className="space-y-3">
        {/* Basic Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold flex items-center gap-1 text-blue-900 dark:text-blue-100 text-xs">
              <Store className="h-3 w-3" />
              Shop Details
            </h4>
            <EditStep onClick={() => goTo(1)} />
          </div>
          <div className="flex items-start gap-3">
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Shop logo"
                className="object-cover rounded-md border-2 border-white shadow-sm"
                width={40}
                height={40}
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {formValues.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                {formValues.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-3 border border-green-100 dark:border-green-800/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold flex items-center gap-1 text-green-900 dark:text-green-100 text-xs">
              <Mail className="h-3 w-3" />
              Contact Information
            </h4>
            <EditStep onClick={() => goTo(3)} />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {formValues.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {formValues.phoneNumber}
              </span>
            </div>
            {formValues.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {formValues.website}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold flex items-center gap-1 text-purple-900 dark:text-purple-100 text-xs">
              <MapPin className="h-3 w-3" />
              Location Information
            </h4>
            <EditStep onClick={() => goTo(4)} />
          </div>
          <div className="flex items-start gap-1.5 text-xs">
            <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
            <div className="text-gray-700 dark:text-gray-300">
              <p>{formValues.streetAddress}</p>
              <p>
                {formValues.city}, {formValues.state} {formValues.zipCode}
              </p>
              <p>{formValues.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Review

type EditStepProps = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

const EditStep = ({ onClick }: EditStepProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-6 text-xs text-primary hover:text-purple-700"
    >
      <Edit className="h-2 w-2 mr-1" />
      Edit
    </Button>
  )
}
