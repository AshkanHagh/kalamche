"use client"

import { useForm } from "react-hook-form"
import useMultiStep from "../../_hooks/useMultiStep"
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
import { STEPS_DETAILS } from "../../_constant/STEPS_DETAILS"

const CreateShopForm = () => {
  const { step, currentStepIndex, isFirstStep } = useMultiStep([])
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
      zipCode: ""
    },
    resolver: zodResolver(formSchema)
  })

  const onSubmit = (data: FormSchemaValues) => {
    console.log(data)
  }

  return (
    <Form {...formMethods}>
      <div className="max-w-lg w-full">
        <Card className="shadow-lg border-t border-border/50 bg-white/80 flex flex-col h-fit w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10">
                {React.createElement(STEPS_DETAILS[currentStepIndex].icon, {
                  className: "h-4 w-4 text-blue-600 dark:text-blue-400"
                })}
              </div>
              {STEPS_DETAILS[currentStepIndex].title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
              {STEPS_DETAILS[currentStepIndex].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>{step}</form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled={isFirstStep}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button>
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
