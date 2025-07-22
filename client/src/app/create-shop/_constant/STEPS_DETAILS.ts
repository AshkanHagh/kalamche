import {
  Building,
  Eye,
  ImageIcon,
  LucideIcon,
  Mail,
  MapPin,
  Store
} from "lucide-react"
import { FormSchemaValues } from "../_schema/formSchema"

export type StepDetails = {
  id: number
  title: string
  description: string
  icon: LucideIcon
  fields: (keyof FormSchemaValues)[]
  hidden?: boolean
}

export const STEPS_DETAILS: StepDetails[] = [
  {
    id: 1,
    title: "Shop Details",
    description: "Name & description",
    icon: Store,
    fields: ["name", "description"] as const
  },
  {
    id: 2,
    title: "Branding",
    description: "Upload your logo",
    icon: ImageIcon,
    fields: ["logo", "logoHasUploaded"] as const
  },
  {
    id: 3,
    title: "Contact Info",
    description: "Email, phone & website",
    icon: Mail,
    fields: ["email", "phoneNumber", "website"] as const
  },
  {
    id: 4,
    title: "Location (Geo)",
    description: "Country, state & city",
    icon: MapPin,
    fields: ["country", "state", "city"] as const
  },
  {
    id: 5,
    title: "Location (Addr)",
    description: "Street & postal code",
    icon: Building,
    fields: ["streetAddress", "zipCode"] as const
  },
  {
    id: 6,
    title: "Review",
    description: "Confirm & submit",
    icon: Eye,
    fields: [] as const,
    hidden: true
  }
]
