"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import useVerificationCode from "../../_hooks/useVerificationCode"
import ResendCode from "./ResendCode"

type VerificationCodeModalProps = {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: number) => Promise<void>
  onResend: () => Promise<void>
  email?: string
  codeLength?: number
}

const VerificationCodeModal = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email = "your email",
  codeLength = 6
}: VerificationCodeModalProps) => {
  const [isVerifying, setIsVerifying] = useState(false)

  const { digits, inputRefs, handleChange, handleKeyDown } =
    useVerificationCode(codeLength, isOpen)

  const handleVerify = async () => {
    const code = digits.join("")
    setIsVerifying(true)
    await onVerify(Number(code))
    setIsVerifying(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            Verify your email
          </DialogTitle>
          <DialogDescription className="pt-2">
            We&apos;ve sent a verification code to{" "}
            <span className="font-medium text-foreground">{email}</span>. Please
            enter the code below to verify your account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex justify-center space-x-2">
            {digits.map((value, index) => (
              <div key={index} className="relative">
                <Input
                  className="h-14 w-12 text-center text-lg font-semibold sm:h-16 sm:w-14"
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  inputMode="numeric"
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  value={value}
                  autoComplete="one-time-code"
                />
                <div
                  className={`absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 transform bg-primary transition-opacity duration-200 ${
                    value ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ))}
          </div>
          <ResendCode onResend={onResend} />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={digits.some((digit) => !digit) || isVerifying}
            className="mb-2 sm:mb-0"
            onClick={handleVerify}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VerificationCodeModal
