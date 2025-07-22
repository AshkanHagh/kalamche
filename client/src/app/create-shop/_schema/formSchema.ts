import { z } from "zod"

export const formSchema = z.object({
  name: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[0-9\s\-()]+$/, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL"),
  logo: z
    .custom<File>()
    .refine((file) => file instanceof File && file.size > 0, {
      message: "Please upload a valid logo"
    }),
  logoHasUploaded: z.boolean().refine((val) => val === true, {
    message: "Please upload a valid logo"
  }),
  country: z.string().min(1, "Please select a country"),
  state: z.string().min(1, "Please select a state/province"),
  city: z.string().min(1, "Please select a city"),
  streetAddress: z
    .string()
    .min(5, "Street address must be at least 5 characters"),
  zipCode: z
    .string()
    .min(3, "ZIP code must be at least 3 characters")
    .max(10, "ZIP code must be less than 10 characters")
})

export type FormSchemaValues = z.infer<typeof formSchema>
