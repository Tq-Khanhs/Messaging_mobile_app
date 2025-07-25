import api from "./api"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const groupService = {
  createGroup: async (groupData) => {
    try {
      const response = await api.post("/groups", groupData)
      return response.data
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error.message)
      throw error
    }
  },

  getGroupById: async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching group:", error.response?.data || error.message)
      throw error
    }
  },
  getGroupByConversationId: async (conversationId) => {
    try {
      const response = await api.get(`/groups/conversation/${conversationId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching group by conversation ID:", error.response?.data || error.message)
      throw error
    }
  },

  getGroups: async () => {
    try {
      const response = await api.get("/groups")
      return response.data
    } catch (error) {
      console.error("Error fetching groups:", error.response?.data || error.message)
      throw error
    }
  },

  updateGroup: async (groupId, updateData) => {
    try {
      const response = await api.put(`/groups/${groupId}`, updateData)
      return response.data
    } catch (error) {
      console.error("Error updating group:", error.response?.data || error.message)
      throw error
    }
  },

   uploadGroupAvatar: async (groupId, imageUri) => {
    try {
      console.log(`Uploading avatar for group ID: ${groupId}`)

      const formData = new FormData()
      formData.append("groupId", groupId)

      // Xử lý URI hình ảnh
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1]

      formData.append("avatar", {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `avatar.${fileType}`,
      })

      console.log("FormData created:", JSON.stringify(formData))

      const response = await api.post(`/groups/${groupId}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Avatar uploaded successfully:", response.data)
      return response.data
    } catch (error) {
      console.error("Error uploading group avatar:", error)

      // Log chi tiết lỗi
      if (error.response) {
        console.log("Error response status:", error.response.status)
        console.log("Error response data:", error.response.data)
      }

      throw error
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const token = AsyncStorage.getItem("authToken")
      const response = await api.delete(`/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error("Error deleting group:", error.response?.data || error.message)
      throw error
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const response = await api.post(`/groups/${groupId}/leave`)
      return response.data
    } catch (error) {
      console.error("Error leaving group:", error.response?.data || error.message)
      throw error
    }
  },

  searchGroups: async (query) => {
    try {
      const response = await api.get(`/groups/search`, {
        params: { query },
      })
      return response.data
    } catch (error) {
      console.error("Error searching groups:", error.response?.data || error.message)
      throw error
    }
  },

  addGroupMembers: async (groupId, memberIds) => {
    try {
      const ids = Array.isArray(memberIds) ? memberIds : [memberIds]

      const results = []

      for (const id of ids) {
        const response = await api.post(`/groups/${groupId}/members`, { userId: id })
        results.push(response.data)
      }

      return results
    } catch (error) {
      console.error("Error adding group members:", error.response?.data || error.message)
      throw error
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const response = await api.delete(`/groups/${groupId}/members/${memberId}`)
      return response.data
    } catch (error) {
      console.error("Error removing group member:", error.response?.data || error.message)
      throw error
    }
  },

  changeGroupMemberRole: async (groupId, memberId, role) => {
    try {
      const response = await api.put(`/groups/${groupId}/members/${memberId}/role`, { role })
      return response.data
    } catch (error) {
      console.error("Error changing member role:", error.response?.data || error.message)
      throw error
    }
  },
}
