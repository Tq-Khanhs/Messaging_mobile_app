import api from "./api"
import { authService } from "./authService"

export const userService = {
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search?query=${query}`)
      return response.data.users
    } catch (error) {
      console.error("Search users error:", error)
      throw error
    }
  },
  getUserProfile: async () => {
    try {
      console.log("Fetching user profile from:", `${api.defaults.baseURL}/users/profile`)
      const token = authService.getToken()

      if (!token) {
        console.error("No authentication token available")
        throw new Error("Authentication required")
      }

      const response = await api.get("/users/profile")
      console.log("User profile response:", response.status, response.data)
      return response.data
    } catch (error) {
      console.error("Get user profile error:", error)
      if (error.response) {
        console.error("Error status:", error.response.status)
        console.error("Error data:", error.response.data)

        if (error.response.status === 401) {
          throw new Error("Unauthorized: Please log in again")
        }
      }
      throw error
    }
  },

  updateUserProfile: async (userData) => {
    try {
      const response = await api.put("/users/profile", userData)
      return response.data
    } catch (error) {
      console.error("Update user profile error:", error)
      throw error
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/users/update-password", {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      console.error("Update password error:", error)
      throw error
    }
  },

  uploadAvatar: async (imageUri) => {
    try {
      console.log("Uploading avatar to:", `${api.defaults.baseURL}/users/avatar`)
      const token = authService.getToken()

      if (!token) {
        console.error("No authentication token available")
        throw new Error("Authentication required")
      }

      const formData = new FormData()
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1]

      formData.append("avatar", {
        uri: imageUri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      })

      const response = await fetch(`${api.defaults.baseURL}/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // KHÔNG cần thêm Content-Type ở đây, fetch sẽ tự động set đúng cho FormData
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Upload failed:", errorData)
        throw new Error(errorData.message || "Failed to upload avatar")
      }

      const result = await response.json()
      console.log("Upload avatar response:", result)
      return result
    } catch (error) {
      console.error("Upload avatar error:", error)
      throw error
    }
  },


  getAvatarUploadUrl: async (fileType) => {
    try {
      const response = await api.post("/users/avatar-upload-url", { fileType })
      return response.data
    } catch (error) {
      console.error("Get avatar upload URL error:", error)
      throw error
    }
  },
  uploadImage: async (imageUri) => {
    try {
      console.log("Uploading image to:", `${api.defaults.baseURL}/upload`)

      const formData = new FormData()
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1]

      formData.append("image", {
        uri: imageUri,
        name: `image.${fileType}`,
        type: `image/${fileType}`,
      })

      const response = await fetch(`${api.defaults.baseURL}/images/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Upload failed:", errorData)
        throw new Error(errorData.message || "Failed to upload image")
      }

      const result = await response.json()
      console.log("Upload image response:", result)
      return result
    } catch (error) {
      console.error("Upload image error:", error)
      throw error
    }
  },
  confirmAvatarUpload: async (key) => {
    try {
      const response = await api.post("/users/confirm-avatar", { key })
      return response.data
    } catch (error) {
      console.error("Confirm avatar upload error:", error)
      throw error
    }
  },
  getUserById: async (userId) => {
    try {
      console.log(`Fetching user details for ID: ${userId}`)
      const response = await api.get(`/users/${userId}`)

      // Log the full response to debug
      console.log("User API response:", response.data)

      // Check if the response has the expected structure
      if (response.data && response.data.user) {
        return response.data.user
      } else if (response.data) {
        // If the user data is directly in the response data (not nested under 'user')
        return response.data
      } else {
        console.error("Unexpected response structure:", response)
        return null
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      if (error.response) {
        console.error("Error response:", error.response.status, error.response.data)
      }
      return null
    }
  }
}
