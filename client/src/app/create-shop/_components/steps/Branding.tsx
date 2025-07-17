"use client"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { LoaderCircle, Upload, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"

const Branding = () => {
  const { control, watch, setError, clearErrors, setValue } = useFormContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const logo = watch("logo")

  const logoPreview = useMemo(() => {
    if (logo instanceof File) {
      return URL.createObjectURL(logo)
    }
    return null
  }, [logo])

  const handleChangeFile = async () => {
    setIsLoading(true)
    clearErrors("logo")
    try {
      await new Promise((resolve, reject) => setTimeout(reject, 2000))
      toast.success("your logo was uploaded!")
    } catch (error) {
      console.log(error)
      setError("logo", { message: "something went wrong" })
      setValue("logo", undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <FormField
        control={control}
        name="logo"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-sm font-semibold sr-only">
              Shop Logo
            </FormLabel>
            <FormControl>
              <div className="flex flex-col items-center space-y-4">
                {logoPreview ? (
                  <div className="relative group">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      className={`object-cover rounded-xl border-4 border-gray-200 dark:border-gray-700 shadow-lg ${isLoading ? "blur-sm" : ""}`}
                      width="112"
                      height="112"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => field.onChange(undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isLoading && (
                        <LoaderCircle className="animate-spin text-primary size-10" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group w-full max-w-xs">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Upload your logo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        field.onChange(
                          e.target.files ? e.target.files[0] : undefined
                        )
                        handleChangeFile()
                      }}
                      ref={field.ref}
                      name={field.name}
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription className="text-center text-xs text-gray-500">
              Upload a logo that represents your brand
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
export default Branding
