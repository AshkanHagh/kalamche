import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent
} from "react"

const useVerificationCode = (length: number, isOpen: boolean = false) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    console.log(inputRefs)
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [isOpen])

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value
    if (!inputValue || inputValue.length > 1 || !/^\d*$/.test(inputValue))
      return
    console.log(inputValue)
    setDigits((prev) => {
      const newDigits = [...prev]
      newDigits[index] = inputValue
      return newDigits
    })
    inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key
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
  return { digits, inputRefs, handleChange, handleKeyDown }
}

export default useVerificationCode
