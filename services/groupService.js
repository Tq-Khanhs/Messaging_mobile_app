import api from "./api"

export const groupService = {
  // Lấy danh sách nhóm của người dùng
  getGroups: async () => {
    try {
      const response = await api.get("/groups")
      return response.data.groups
    } catch (error) {
      console.error("Get groups error:", error)
      throw error
    }
  },
}