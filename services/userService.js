import api from "./api"
import { authService } from "./authService"

// User API services
export const userService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const token = authService.getToken()
      const response = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const token = authService.getToken()
      const response = await api.put("/users/profile", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error("Update user profile error:", error)
      throw error
    }
  },

  // Get avatar upload URL
  getAvatarUploadUrl: async (fileType) => {
    try {
      const token = authService.getToken()
      const response = await api.post(
        "/users/avatar-upload-url",
        { fileType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Get avatar upload URL error:", error)
      throw error
    }
  },

  // Upload to S3
  uploadToS3: async (uploadUrl, imageUri, fileType) => {
    try {
      // Create form data for image upload
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
        },
        body: imageUri,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image to S3")
      }

      return { success: true }
    } catch (error) {
      console.error("Upload to S3 error:", error)
      throw error
    }
  },

  // Confirm avatar upload
  confirmAvatarUpload: async (key) => {
    try {
      const token = authService.getToken()
      const response = await api.post(
        "/users/confirm-avatar",
        { key },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Confirm avatar upload error:", error)
      throw error
    }
  },

  // Upload avatar directly
  uploadAvatarDirectly: async (imageUri) => {
    try {
      const token = authService.getToken()

      // Create form data for image upload
      const formData = new FormData()
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
      })

      const response = await fetch(`${api.defaults.baseURL}/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload avatar")
      }

      return await response.json()
    } catch (error) {
      console.error("Upload avatar directly error:", error)
      throw error
    }
  },
}

