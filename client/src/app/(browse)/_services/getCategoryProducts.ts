import axios from "@/lib/api/axios"
import { handleApiError } from "@/lib/utils"
import { ServerError } from "@/types"
import { AxiosError } from "axios"
import { CategoryResponse } from "../_types"
import { mockCategoryProducts } from "../_mock/data"

type SuccessReturnType = {
  isSuccess: true
  data: CategoryResponse
}

type ErrorReturnType = {
  isSuccess: false
  errorMessage: string
}

type GetCategoryProductsResponse = Promise<SuccessReturnType | ErrorReturnType>

const getCategoryProducts = async (
  categoryName: string,
  offset: number,
  limit: number
): GetCategoryProductsResponse => {
  // try {
  //   const response = await axios<CategoryResponse>(
  //     `/api/products/category/${categoryName}?offset=${offset}&limit=${limit}`
  //   )
  //   return { data: response.data, isSuccess: true }
  // } catch (e) {
  //   const error = e as AxiosError<ServerError>
  //   const { errorMessage } = handleApiError(error)
  //   console.error("Error fetching category products:", errorMessage)
  //   return { errorMessage, isSuccess: false }
  // }
  await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate network delay
  return { data: mockCategoryProducts, isSuccess: true }
}

export default getCategoryProducts
