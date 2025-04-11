import api from "./api"
import { authService } from "./authService"


export const userService = {

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


  getAvatarUploadUrl: async (fileType) => {
    try {
      console.log("Getting avatar upload URL for fileType:", fileType)
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
      console.log("Avatar upload URL response:", {
        hasUploadUrl: !!response.data.uploadUrl,
        hasKey: !!response.data.key,
      })
      return response.data
    } catch (error) {
      console.error("Get avatar upload URL error:", error)
      throw error
    }
  },

  uploadToS3: async (uploadUrl, imageUri, fileType) => {
    try {
      console.log("Uploading to S3 URL:", uploadUrl ? uploadUrl.substring(0, 50) + "..." : "undefined")
      console.log("Image URI:", imageUri ? "Available" : "Not available")


      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
        },
        body: imageUri,
      })

      console.log("S3 upload response status:", response.status)

      if (!response.ok) {
        throw new Error(`Failed to upload image to S3: ${response.status} ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Upload to S3 error:", error)
      throw error
    }
  },

  confirmAvatarUpload: async (key) => {
    try {
      console.log("Confirming avatar upload with key:", key)
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
      console.log("Confirm avatar response:", {
        hasAvatarUrl: !!response.data.avatarUrl,
        avatarUrl: response.data.avatarUrl,
      })
      return response.data
    } catch (error) {
      console.error("Confirm avatar upload error:", error)
      throw error
    }
  },

  uploadAvatarDirectly: async (imageUri) => {
    try {
      const token = authService.getToken()

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
