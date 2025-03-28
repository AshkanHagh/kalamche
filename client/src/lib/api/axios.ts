const BASE_URL = "http://localhost:7319"
import axios from "axios"

export default axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
})

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
})
