import api from "./api"
import FormData from "form-data"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const messageService = {
  // Get all conversations
  getConversations: async () => {
    try {
      // Get the authentication token from localStorage or your auth state
      const token = AsyncStorage.getItem('authToken'); // or however you store your auth token
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await api.get("/messages/conversations", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.conversations;
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
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

      // If we're only sending one image, simplify the process
      if (imageUris.length === 1) {
        const formData = new FormData()
        formData.append("conversationId", conversationId)

        const uri = imageUris[0]
        const uriParts = uri.split(".")
        const fileType = uriParts[uriParts.length - 1]

        formData.append("images", {
          uri: uri,
          type: `image/${fileType}`,
          name: `image.${fileType}`,
        })

        console.log("Sending image with FormData:", formData)

        // For demo purposes, create a mock response
        // In a real app, this would be the API call:
        // const response = await api.post("/messages/send/image", formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // });

        // Mock response for demo
        const mockResponse = {
          messageId: `img-${Date.now()}`,
          content: "",
          type: "image",
          attachments: [
            {
              url: uri,
              type: `image/${fileType}`,
              name: `image.${fileType}`,
              size: 100000,
              _id: Date.now() + Math.random().toString(),
            },
          ],
          senderId: await getCurrentUserId(),
          createdAt: new Date().toISOString(),
          isDeleted: false,
          isRecalled: false,
        }

        console.log("Image message sent successfully:", mockResponse)
        return mockResponse
      } else {
        // Original implementation for  multiple images
        const formData = new FormData()
        formData.append("conversationId", conversationId)

        const attachments = imageUris.map((uri, index) => {
          const uriParts = uri.split(".")
          const fileType = uriParts[uriParts.length - 1]

          formData.append("images", {
            uri: uri,
            type: `image/${fileType}`,
            name: `image${index}.${fileType}`,
          })

          return {
            url: uri,
            type: `image/${fileType}`,
            name: `image${index}.${fileType}`,
            size: 100000,
            _id: Date.now() + index + Math.random().toString(),
          }
        })

        // Mock response for demo with multiple images
        const mockResponse = {
          messageId: `img-group-${Date.now()}`,
          content: "",
          type: "imageGroup",
          attachments: attachments,
          senderId: await getCurrentUserId(),
          createdAt: new Date().toISOString(),
          isDeleted: false,
          isRecalled: false,
        }

        return mockResponse
      }
    } catch (error) {
      console.error("Send image message error:", error)
      throw error
    }
  },

  // Send file message
  sendFileMessage: async (conversationId, fileUri, fileName, fileType, fileSize) => {
    try {
      console.log(`Sending file message to conversation: ${conversationId}`, {
        fileUri,
        fileName,
        fileType,
        fileSize,
      })

      // Kiểm tra các tham số đầu vào
      if (!conversationId) {
        throw new Error("Missing conversationId")
      }
      if (!fileUri) {
        throw new Error("Missing fileUri")
      }
      if (!fileName) {
        fileName = fileUri.split("/").pop() || "unknown_file"
      }
      if (!fileType) {
        // Đoán loại file từ phần mở rộng
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

      const formData = new FormData()
      formData.append("conversationId", conversationId)
      formData.append("file", {
        uri: fileUri,
        type: fileType,
        name: fileName,
      })

      // Sử dụng kích thước file thực tế nếu có
      const fileSizeValue = fileSize || 2270148 // Mock file size nếu không có kích thước thực tế

      // Mock response for demo
      const mockResponse = {
        messageId: `file-${Date.now()}`,
        content: "",
        type: "file",
        attachments: [
          {
            url: fileUri,
            type: fileType,
            name: fileName,
            size: fileSizeValue,
            _id: Date.now() + Math.random().toString(),
          },
        ],
        senderId: await getCurrentUserId(),
        createdAt: new Date().toISOString(),
        isDeleted: false,
        isRecalled: false,
      }

      console.log("File message prepared successfully:", mockResponse)
      return mockResponse
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
