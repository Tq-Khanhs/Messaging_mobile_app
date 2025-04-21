import api from "./api"
import FormData from "form-data"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const messageService = {
  // Get all conversations
  getConversations: async () => {
    try {
      // Get the authentication token from localStorage or your auth state
      const token = AsyncStorage.getItem("authToken") // or however you store your auth token

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await api.get("/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Process conversations to ensure group information is available
      const conversations = response.data.conversations.map((conversation) => {
        if (conversation.isGroup) {
          // Ensure group conversations have required fields
          return {
            ...conversation,
            groupName: conversation.groupName || "Nhóm chat",
            members: conversation.members || [],
            // If no avatarUrl is provided, we'll handle that in the UI
          }
        }
        return conversation
      })

      return conversations
    } catch (error) {
      console.error("Get conversations error:", error)
      throw error
    }
  },

  // Get or start conversation with a user
  getOrStartConversation: async (userId) => {
    try {
      const response = await api.get(`/messages/conversations/user/${userId}`)
      return response.data.conversation
    } catch (error) {
      console.error("Get or start conversation error:", error)
      throw error
    }
  },

  // Get messages in a conversation
  getMessages: async (conversationId) => {
    try {
      console.log(`Fetching messages for conversation: ${conversationId}`)
      const response = await api.get(`/messages/conversations/${conversationId}/messages`)
      console.log(`Received ${response.data.messages.length} messages`)
      return response.data.messages
    } catch (error) {
      console.error("Get messages error:", error)
      throw error
    }
  },

  // Send text message
  sendTextMessage: async (conversationId, content) => {
    try {
      console.log(`Sending text message to conversation: ${conversationId}`)
      const response = await api.post("/messages/send/text", { conversationId, content })
      console.log("Message sent successfully:", response.data.messageData)
      return response.data.messageData
    } catch (error) {
      console.error("Send text message error:", error)
      throw error
    }
  },

  // Send emoji message
  sendEmojiMessage: async (conversationId, emoji) => {
    try {
      console.log(`Sending emoji message to conversation: ${conversationId}`)
      const response = await api.post("/messages/send/emoji", { conversationId, emoji })
      console.log("Emoji sent successfully:", response.data.messageData)
      return response.data.messageData
    } catch (error) {
      console.error("Send emoji message error:", error)
      throw error
    }
  },

  // Send image message
  sendImageMessage: async (conversationId, imageUris) => {
    try {
      console.log(`Sending image message to conversation: ${conversationId}`)

      const formData = new FormData()
      formData.append("conversationId", conversationId)

      // Handle single or multiple images
      if (Array.isArray(imageUris)) {
        imageUris.forEach((uri, index) => {
          const uriParts = uri.split(".")
          const fileType = uriParts[uriParts.length - 1]

          formData.append("images", {
            uri: uri,
            type: `image/${fileType}`,
            name: `image${index}.${fileType}`,
          })
        })
      } else {
        const uri = imageUris
        const uriParts = uri.split(".")
        const fileType = uriParts[uriParts.length - 1]

        formData.append("images", {
          uri: uri,
          type: `image/${fileType}`,
          name: `image.${fileType}`,
        })
      }

      const response = await api.post("/messages/send/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Image message sent successfully:", response.data.messageData)
      return response.data.messageData
    } catch (error) {
      console.error("Send image message error:", error)
      throw error
    }
  },

  // Send file message
  sendFileMessage: async (conversationId, fileUri, fileName, fileType) => {
    try {
      console.log(`Sending file message to conversation: ${conversationId}`)

      const formData = new FormData()
      formData.append("conversationId", conversationId)

      if (!fileName) {
        fileName = fileUri.split("/").pop() || "file"
      }

      if (!fileType) {
        const extension = fileName.split(".").pop().toLowerCase()
        switch (extension) {
          case "pdf":
            fileType = "application/pdf"
            break
          case "doc":
          case "docx":
            fileType = "application/msword"
            break
          case "xls":
          case "xlsx":
            fileType = "application/vnd.ms-excel"
            break
          case "ppt":
          case "pptx":
            fileType = "application/vnd.ms-powerpoint"
            break
          case "txt":
            fileType = "text/plain"
            break
          case "zip":
            fileType = "application/zip"
            break
          case "rar":
            fileType = "application/x-rar-compressed"
            break
          default:
            fileType = "application/octet-stream"
        }
      }

      formData.append("file", {
        uri: fileUri,
        type: fileType,
        name: fileName,
      })

      const response = await api.post("/messages/send/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("File message sent successfully:", response.data.messageData)
      return response.data.messageData
    } catch (error) {
      console.error("Send file message error:", error)
      throw error
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      const response = await api.put(`/messages/messages/${messageId}/read`)
      return response.data
    } catch (error) {
      console.error("Mark message as read error:", error)
      throw error
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/messages/messages/${messageId}`)
      return response.data.messageData
    } catch (error) {
      console.error("Delete message error:", error)
      throw error
    }
  },

  // Recall message
  recallMessage: async (messageId) => {
    try {
      const response = await api.put(`/messages/messages/${messageId}/recall`)
      return response.data.messageData
    } catch (error) {
      console.error("Recall message error:", error)
      throw error
    }
  },

  // Forward message
  forwardMessage: async (messageId, conversationId) => {
    try {
      const response = await api.post("/messages/messages/forward", { messageId, conversationId })
      return response.data.messageData
    } catch (error) {
      console.error("Forward message error:", error)
      throw error
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/messages/unread")
      return response.data.unreadCount
    } catch (error) {
      console.error("Get unread count error:", error)
      throw error
    }
  },

  // Get group information
  getGroupInfo: async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}`)
      return response.data.group
    } catch (error) {
      console.error("Get group info error:", error)
      throw error
    }
  },

  // Add this new function to get group information by conversationId
  getGroupByConversationId: async (conversationId) => {
    try {
      const response = await api.get(`/groups/conversation/${conversationId}`)
      return response.data.group
    } catch (error) {
      console.error("Get group by conversation ID error:", error)
      throw error
    }
  },
}

// Helper function to get current user ID
async function getCurrentUserId() {
  try {
    const userString = await AsyncStorage.getItem("user")
    if (userString) {
      const user = JSON.parse(userString)
      return user.userId
    }
    return null
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}
