import { StepDetails } from "@/app/create-shop/_constant/STEPS_DETAILS"
import { createContext, ReactElement, useContext } from "react"

type MultiStepContextType = {
  steps: ReactElement[]
  currentStepIndex: number
  isFirstStep: boolean
  isLastStep: boolean
  currentStepDetails: StepDetails
  next: () => void
  back: () => void
  goTo: (stepIndex: number) => void
}

export const MultiStepContext = createContext<MultiStepContextType | null>(null)

export const MultiStepContextProvider = ({
  children,
  value
}: {
  children: React.ReactElement
  value: MultiStepContextType
}) => {
  return <MultiStepContext value={value}>{children}</MultiStepContext>
}

export const useMultiStepContext = () => {
  const context = useContext(MultiStepContext)
  if (!context)
    throw new Error("useMultiStepContext must be used inside step components")

  return context
}
