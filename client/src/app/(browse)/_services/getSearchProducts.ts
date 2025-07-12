import { SearchResponse } from "../_types"
import { mockSearchProducts } from "../_mock/data"

type SuccessReturnType = {
  isSuccess: true
  data: SearchResponse
}

type ErrorReturnType = {
  isSuccess: false
  errorMessage: string
}

type GetSearchProductsResponse = Promise<SuccessReturnType | ErrorReturnType>

const getSearchProducts = async (
  search: string | undefined,
  offset: number,
  limit: number
): GetSearchProductsResponse => {
  // try {
  // const correctSearch = search === "" ? "phone" : undefined
  //   const response = await axios<SearchResponse>(
  //     `/api/products/search?offset=${offset}&limit=${limit}&search=${search}`
  //   )
  //   return { data: response.data, isSuccess: true }
  // } catch (e) {
  //   const error = e as AxiosError<ServerError>
  //   const { errorMessage } = handleApiError(error)
  //   console.error("Error fetching search products:", errorMessage)
  //   return { errorMessage, isSuccess: false }
  // }
  console.log("Server fetch search data -------------")
  await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate network delay
  return { data: mockSearchProducts, isSuccess: true }
}

export default getSearchProducts
