import { XCircle } from "lucide-react"
import { useEffect } from "react"

type VerificationErrorProps = {
  errorMessage: string
  onError?: () => void
}

const VerificationError = ({
  errorMessage = "Something went wrong",
  onError
}: VerificationErrorProps) => {
  if (onError) onError()

  useEffect(() => {
    if (onError) onError()
  }, [onError])

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-8 shadow-lg dark:border-red-900 dark:bg-red-900/20 transition-all duration-300`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-red-800 dark:text-red-400">
          Verification Failed
        </h2>
        <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
export default VerificationError
