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


    uploadGroupAvatar: async (groupId, formData) => {
        try {
            const response = await api.post(`/groups/${groupId}/avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            return response.data
        } catch (error) {
            console.error("Error uploading group avatar:", error.response?.data || error.message)
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
            const response = await api.post(`/groups/${groupId}/members`, {userId: memberIds })
            return response.data
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
