import VerificationError from "./VerificationError"
import VerificationLoading from "./VerificationLoading"
import VerificationSuccess from "./VerificationSuccess"

type VerificationStatusProps = {
  status: "loading" | "success" | "error"
  errorMessage: string
  redirectUrl: string
}

const VerificationStatus = ({
  status,
  errorMessage,
  redirectUrl
}: VerificationStatusProps) => {
  switch (status) {
    case "loading":
      return <VerificationLoading />

    case "success":
      return <VerificationSuccess redirectUrl={redirectUrl} />
    case "error":
      return <VerificationError errorMessage={errorMessage} />
  }
}
export default VerificationStatus
