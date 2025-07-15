import { Store } from "lucide-react"
import CreateShopForm from "./_components/form/CreateShopForm"

const CreateShopPage = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen -mt-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-gradient-to-tr from-primary to-primary/50 mb-3">
            <Store className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
            Create Your Shop
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
            Join thousands of sellers and start your journey today
          </p>
        </div>
        <CreateShopForm />
        <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400 mb-5">
          <p>
            By creating a shop, you agree to our{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
export default CreateShopPage
