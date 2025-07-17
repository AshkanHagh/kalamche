import { ReactElement, useState } from "react"
import { STEPS_DETAILS } from "../_constant/STEPS_DETAILS"

const useMultiStep = (steps: ReactElement[]) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const next = () => {
    setCurrentStepIndex((i) => (i >= steps.length - 1 ? i : i + 1))
  }

  const back = () => {
    setCurrentStepIndex((i) => (i <= 0 ? i : i - 1))
  }

  const goTo = (index: number) => {
    setCurrentStepIndex(() => {
      return index > steps.length - 1 ? steps.length - 1 : index < 0 ? 0 : index
    })
  }

  const currentStepDetails = STEPS_DETAILS[currentStepIndex]

  return {
    step: steps[currentStepIndex],
    steps,
    currentStepIndex,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    currentStepDetails,
    next,
    back,
    goTo
  }
}

export default useMultiStep
