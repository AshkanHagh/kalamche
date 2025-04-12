import VerificationError from "./VerificationError"
import VerificationLoading from "./VerificationLoading"
import VerificationSuccess from "./VerificationSuccess"

type VerificationStatusProps = {
  status: "loading" | "success" | "error"
  errorMessage: string
  onSuccess?: () => void
  onError?: () => void
}

const VerificationStatus = ({
  status,
  errorMessage,
  onSuccess,
  onError
}: VerificationStatusProps) => {
  switch (status) {
    case "loading":
      return <VerificationLoading />

    case "success":
      return <VerificationSuccess onSuccess={onSuccess} />
    case "error":
      return <VerificationError errorMessage={errorMessage} onError={onError} />
  }
}
export default VerificationStatus
