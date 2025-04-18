import api from "./api"

export const friendService = {
  // Get all friends
  getFriends: async () => {
    try {
      const response = await api.get("/friends")
      return response.data.friends
    } catch (error) {
      console.error("Get friends error:", error)
      throw error
    }
  },

  // Get sent friend requests
  getSentFriendRequests: async () => {
    try {
      const response = await api.get("/friends/requests/sent")
      return response.data.friendRequests
    } catch (error) {
      console.error("Get sent friend requests error:", error)
      throw error
    }
  },

  // Get received friend requests
  getReceivedFriendRequests: async () => {
    try {
      const response = await api.get("/friends/requests/received")
      return response.data.friendRequests
    } catch (error) {
      console.error("Get received friend requests error:", error)
      throw error
    }
  },

  // Send friend request
  sendFriendRequest: async (receiverId, message = "") => {
    try {
      const response = await api.post("/friends/requests", { receiverId, message })
      return response.data.friendRequest
    } catch (error) {
      console.error("Send friend request error:", error)
      throw error
    }
  },

  // Respond to friend request (accept or reject)
  respondToFriendRequest: async (requestId, action) => {
    try {
      const response = await api.post("/friends/requests/respond", { requestId, action })
      return response.data.friendRequest
    } catch (error) {
      console.error("Respond to friend request error:", error)
      throw error
    }
  },

  // Check friendship status with another user
  checkFriendshipStatus: async (userId) => {
    try {
      const response = await api.get(`/friends/status/${userId}`)
      return response.data
    } catch (error) {
      console.error("Check friendship status error:", error)
      throw error
    }
  },

  // Withdraw/cancel a friend request
  withdrawFriendRequest: async (requestId) => {
    try {
      const response = await api.delete(`/friends/requests/${requestId}`)
      return response.data
    } catch (error) {
      console.error("Withdraw friend request error:", error)
      throw error
    }
  },

  // Remove a friend
  removeFriend: async (friendId) => {
    try {
      const response = await api.delete(`/friends/${friendId}`)
      return response.data
    } catch (error) {
      console.error("Remove friend error:", error)
      throw error
    }
  },
}
