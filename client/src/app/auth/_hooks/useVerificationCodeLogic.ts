import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type ChangeEvent,
  type KeyboardEvent
} from "react"

const useVerificationCode = (length: number, isOpen: boolean = false) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [isOpen])

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value
    if (!inputValue || inputValue.length > 1 || !/^\d*$/.test(inputValue))
      return
    setDigits((prev) => {
      const newDigits = [...prev]
      newDigits[index] = inputValue
      return newDigits
    })
    inputRefs.current[index + 1]?.focus()
  }

  const handleArrowNavigation = (key: string, index: number) => {
    if ((key === "ArrowLeft" || key === "ArrowDown") && index >= 1) {
      console.log("left Clicked")
      inputRefs.current[index - 1]?.focus()
    }
    if ((key === "ArrowRight" || key === "ArrowUp") && index <= length - 2) {
      console.log(index)
      console.log("right Clicked")
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key
    handleArrowNavigation(key, index)

    if (key !== "Backspace") return

    setDigits((prev) => {
      const newDigits = [...prev]
      if (newDigits[index]) {
        newDigits[index] = ""
      } else {
        inputRefs.current[index - 1]?.focus()
        newDigits[index - 1] = ""
      }

      return newDigits
    })
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const newDigits: string[] = []
    const pastedData: string[] = e.clipboardData
      .getData("text/plain")
      .trim()
      .split("")

    const pastedDataDigits = pastedData
      .filter((char) => /\d/.test(char))
      .slice(0, length)

    for (let i = 0; i < length; i++) {
      newDigits[i] = pastedDataDigits[i] ? pastedDataDigits[i] : ""
    }
    setDigits(newDigits)

    const nextEmptyIndex = newDigits.findIndex((digit) => !digit)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[length - 1]?.focus()
    }
  }
  return { digits, inputRefs, handleChange, handleKeyDown, handlePaste }
}

export default useVerificationCode
