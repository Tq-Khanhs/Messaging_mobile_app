import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Base URL for API requests - replace with your actual server URL
const BASE_URL = "http://172.19.192.1:5000/api"

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Improve the request interceptor to better handle authentication
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (token) {
        console.log(`Adding auth token to ${config.url} request (token length: ${token.length})`)
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log(`No auth token available for ${config.url} request`)
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Improve the response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized access detected in API response")

      // You might want to implement token refresh logic here
      // For now, we'll just log the error

      // If token refresh fails or is not implemented, clear token
      try {
        await AsyncStorage.removeItem("authToken")
        console.log("Auth token cleared due to 401 response")
      } catch (storageError) {
        console.error("Error clearing auth token:", storageError)
      }
    }
    return Promise.reject(error)
  },
)

export default api
