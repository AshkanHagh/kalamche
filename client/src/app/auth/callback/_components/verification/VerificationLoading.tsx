import { Loader2 } from "lucide-react"

const VerificationLoading = () => {
  return (
    <div
      className={`rounded-lg border bg-card p-8 shadow-lg transition-all duration-300`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Verifying your account
        </h2>
        <p className="text-muted-foreground">
          Please wait while we verify your information...
        </p>
      </div>
    </div>
  )
}
export default VerificationLoading
