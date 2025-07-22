"use client"

import { useForm } from "react-hook-form"
import useMultiStep from "../../../../hooks/useMultiStep"
import { formSchema, FormSchemaValues } from "../../_schema/formSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import ShopDetails from "../steps/ShopDetails"
import Branding from "../steps/Branding"
import ContactInfo from "../steps/ContactInfo"
import GeoLocation from "../steps/GeoLocation"
import AddrLocation from "../steps/AddrLocation"
import Review from "../steps/Review"
import { MultiStepContextProvider } from "@/lib/context/MultiStepContext"

const CreateShopForm = () => {
  const multiStepData = useMultiStep([
    <ShopDetails key="shop-details" />,
    <Branding key="branding" />,
    <ContactInfo key="contact-info" />,
    <GeoLocation key="geo-location" />,
    <AddrLocation key="address-location" />,
    <Review key="review" />
  ])
  const formMethods = useForm<FormSchemaValues>({
    defaultValues: {
      city: "",
      country: "",
      description: "",
      email: "",
      name: "",
      phoneNumber: "",
      state: "",
      streetAddress: "",
      website: "",
      zipCode: "",
      logo: undefined
    },
    resolver: zodResolver(formSchema)
  })

  const {
    step,
    currentStepIndex,
    isFirstStep,
    steps,
    next,
    back,
    currentStepDetails
  } = multiStepData
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const onSubmit = (data: FormSchemaValues) => {
    console.log(data)
  }
  const handleNext = async () => {
    const result = await formMethods.trigger(currentStepDetails.fields)
    if (result) next()
  }

  return (
    <Form {...formMethods}>
      <div className="max-w-lg w-[98%]">
        <div className="w-11/12 my-6 mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <Card className="shadow-none sm:shadow-xl sm:border border-border bg-white/80 flex flex-col h-fit w-full">
          {!currentStepDetails.hidden && (
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10">
                  {React.createElement(currentStepDetails.icon, {
                    className: "h-4 w-4 text-blue-600 dark:text-blue-400"
                  })}
                </div>
                {currentStepDetails.title}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                {currentStepDetails.description}
              </CardDescription>
            </CardHeader>
          )}

          <CardContent>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <MultiStepContextProvider value={multiStepData}>
                {step}
              </MultiStepContextProvider>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button onClick={back} variant="outline" disabled={isFirstStep}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Form>
  )
}
export default CreateShopForm
