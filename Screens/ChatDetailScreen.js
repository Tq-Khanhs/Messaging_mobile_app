"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Keyboard,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Linking,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { formatMessageTime } from "../utils/timeUtils"
import { messageService } from "../services/messageService"
import { authService } from "../services/authService"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
// Thêm import cho DocumentPicker từ expo-document-picker
import * as DocumentPicker from "expo-document-picker"
// Remove DocumentPicker import

const { width, height } = Dimensions.get("window")

// Common emojis array
const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "👏",
  "🙏",
  "🎉",
  "✨",
  "⭐",
  "🌟",
  "💯",
  "💪",
]

// Component để hiển thị gallery ảnh
const ImageGallery = ({ images, visible, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.galleryContainer}>
        <View style={styles.galleryHeader}>
          <TouchableOpacity onPress={onClose} style={styles.galleryCloseButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.galleryCounter}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        <View style={styles.galleryImageContainer}>
          <Image
            source={{ uri: images[currentIndex]?.url || images[currentIndex] }}
            style={styles.galleryImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.galleryControls}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handlePrevious} style={styles.galleryControlButton}>
              <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {currentIndex < images.length - 1 && (
            <TouchableOpacity onPress={handleNext} style={styles.galleryControlButton}>
              <Ionicons name="chevron-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )
}

// Component để hiển thị nhiều ảnh trong một tin nhắn
const ImageGroupPreview = ({ attachments, onPress }) => {
  // Hiển thị tối đa 4 ảnh, nếu nhiều hơn thì hiển thị số lượng còn lại
  const maxPreviewImages = 4
  const previewImages = attachments.slice(0, maxPreviewImages)
  const remainingCount = attachments.length - maxPreviewImages

  return (
    <View style={styles.imageGroupContainer}>
      <View style={styles.imageGrid}>
        {previewImages.map((attachment, index) => (
          <TouchableOpacity
            key={attachment._id || index}
            style={[
              styles.gridImageContainer,
              attachments.length === 1 && styles.singleImageContainer,
              attachments.length === 2 && styles.doubleImageContainer,
              attachments.length >= 3 && styles.multipleImageContainer,
            ]}
            onPress={() => onPress(index)}
          >
            <Image source={{ uri: attachment.url }} style={styles.gridImage} resizeMode="cover" />
            {index === maxPreviewImages - 1 && remainingCount > 0 && (
              <View style={styles.remainingCountOverlay}>
                <Text style={styles.remainingCountText}>+{remainingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const EmojiPicker = ({ onEmojiSelected }) => {
  return (
    <View style={styles.emojiPickerContainer}>
      <ScrollView>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((emoji, index) => (
            <TouchableOpacity key={`emoji-${index}`} style={styles.emojiButton} onPress={() => onEmojiSelected(emoji)}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const ChatDetailScreen = ({ route, navigation }) => {
  const { conversation } = route.params || {
    name: "Nguyễn Minh Đức",
    avatar: require("../assets/icon.png"),
    online: false,
  }

  // Refs
  const flatListRef = useRef(null)
  const inputRef = useRef(null)

  // State
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [replyingToMessage, setReplyingToMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [sending, setSending] = useState(false)

  // Yêu cầu quyền truy cập vào thư viện ảnh và tệp tin
  useEffect(() => {
    ;(async () => {
      // Yêu cầu quyền truy cập vào thư viện ảnh
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (mediaLibraryStatus !== "granted") {
        Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào thư viện ảnh để gửi hình ảnh và file.")
      }
    })()
  }, [])

  // State cho gallery ảnh
  const [galleryVisible, setGalleryVisible] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)

  // Update the useEffect hook to properly handle the conversation ID
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
      setShowAttachmentOptions(false)
      setShowEmojiPicker(false)
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false))

    // Load current user and messages
    const loadData = async () => {
      try {
        setLoading(true)
        let user = null
        if (authService && typeof authService.getCurrentUser === "function") {
          user = await authService.getCurrentUser()
        } else {
          // Fallback to get user from AsyncStorage directly
          const userString = await AsyncStorage.getItem("user")
          user = userString ? JSON.parse(userString) : null
        }
        setCurrentUser(user)

        // Debug the conversation object
        console.log("Conversation object received:", conversation)

        // Make sure we have a valid conversation ID
        if (conversation && conversation.id) {
          console.log(`Loading messages for conversation: ${conversation.id}`)
          await fetchMessages()
        } else {
          console.error("No valid conversation ID provided")
          console.error("Conversation object:", JSON.stringify(conversation))
          setError("Invalid conversation data")
        }
      } catch (err) {
        console.error("Error loading chat data:", err)
        setError("Failed to load messages")
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Set up polling for new messages
    const intervalId = setInterval(() => {
      if (conversation && conversation.id) {
        fetchMessages()
      }
    }, 5000) // every 5 seconds

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
      clearInterval(intervalId)
    }
  }, [conversation])

  const fetchMessages = async () => {
    try {
      if (!conversation.id) return

      console.log(`Fetching messages for conversation: ${conversation.id}`)
      const data = await messageService.getMessages(conversation.id)

      // Sort messages by creation time (newest first)
      const sortedMessages = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setMessages(sortedMessages)
      setError(null)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages")
    }
  }

  const handleSend = async () => {
    if (inputText.trim() === "" || sending) return

    try {
      setSending(true)

      // Get the current time
      const currentTime = new Date()

      // Optimistically add message to UI
      const newMessage = {
        messageId: `temp-${Date.now()}`,
        content: inputText,
        timestamp: currentTime,
        senderId: currentUser?.userId,
        type: "text",
        isDeleted: false,
        isRecalled: false,
        createdAt: currentTime.toISOString(),
      }

      setMessages([newMessage, ...messages])
      setInputText("")
      setReplyingToMessage(null)

      // Actually send the message
      console.log(`Sending message to conversation: ${conversation.id}`)
      const response = await messageService.sendTextMessage(conversation.id, inputText)

      // Update the temporary message with the real one
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.messageId === newMessage.messageId ? response : msg)),
      )
    } catch (err) {
      console.error("Error sending message:", err)
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.")

      // Remove the temporary message on error
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.messageId !== `temp-${Date.now()}`))
    } finally {
      setSending(false)
      Keyboard.dismiss()
    }
  }

  const toggleAttachmentOptions = () => {
    setShowAttachmentOptions(!showAttachmentOptions)
    setShowEmojiPicker(false)
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
    setShowAttachmentOptions(false)
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
  }

  const handleEmojiSelected = (emoji) => {
    setInputText(inputText + emoji)
  }

  const handleSendEmoji = async (emoji) => {
    // If it's just an emoji with no other text, send it directly
    if (inputText.trim() === "") {
      try {
        setSending(true)

        // Get the current time
        const currentTime = new Date()

        // Optimistically add emoji to UI
        const newMessage = {
          messageId: `temp-${Date.now()}`,
          content: emoji,
          timestamp: currentTime,
          senderId: currentUser?.userId,
          type: "emoji",
          isDeleted: false,
          isRecalled: false,
          createdAt: currentTime.toISOString(),
        }

        setMessages([newMessage, ...messages])
        setReplyingToMessage(null)

        // Send the emoji message to the server
        console.log(`Sending emoji to conversation: ${conversation.id}`)
        const response = await messageService.sendEmojiMessage(conversation.id, emoji)

        // Update the temporary message with the real one
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.messageId === newMessage.messageId ? response : msg)),
        )
      } catch (err) {
        console.error("Error sending emoji message:", err)
        Alert.alert("Lỗi", "Không thể gửi emoji. Vui lòng thử lại.")

        // Remove the temporary message on error
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.messageId !== `temp-${Date.now()}`))
      } finally {
        setSending(false)
      }
    } else {
      // Otherwise, add it to the input text
      handleEmojiSelected(emoji)
    }
  }

  const handleMessagePress = (messageId) => {
    // Toggle selected message for time display
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null)
    } else {
      setSelectedMessageId(messageId)
    }
  }

  const handleReplyToMessage = (message) => {
    setReplyingToMessage(message)
    // Focus the input field
    if (isKeyboardVisible === false) {
      // This will trigger the keyboard to show
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const handleCancelReply = () => {
    setReplyingToMessage(null)
  }

  const handleLongPress = (message) => {
    // Show action menu for message
    if (message.senderId === currentUser?.userId) {
      // Show options for own messages
      Alert.alert(
        "Tùy chọn tin nhắn",
        "",
        [
          {
            text: "Thu hồi",
            onPress: () => handleRecallMessage(message),
            style: "destructive",
          },
          {
            text: "Xóa",
            onPress: () => handleDeleteMessage(message),
            style: "destructive",
          },
          {
            text: "Trả lời",
            onPress: () => handleReplyToMessage(message),
          },
          {
            text: "Hủy",
            style: "cancel",
          },
        ],
        { cancelable: true },
      )
    } else {
      // Show options for others' messages
      Alert.alert(
        "Tùy chọn tin nhắn",
        "",
        [
          {
            text: "Trả lời",
            onPress: () => handleReplyToMessage(message),
          },
          {
            text: "Hủy",
            style: "cancel",
          },
        ],
        { cancelable: true },
      )
    }
  }

  const handleDeleteMessage = async (message) => {
    try {
      await messageService.deleteMessage(message.messageId)

      // Update message in UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.messageId === message.messageId ? { ...msg, isDeleted: true } : msg)),
      )
    } catch (err) {
      console.error("Error deleting message:", err)
      Alert.alert("Lỗi", "Không thể xóa tin nhắn. Vui lòng thử lại.")
    }
  }

  const handleRecallMessage = async (message) => {
    try {
      await messageService.recallMessage(message.messageId)

      // Update message in UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.messageId === message.messageId ? { ...msg, isRecalled: true } : msg)),
      )
    } catch (err) {
      console.error("Error recalling message:", err)
      Alert.alert("Lỗi", "Không thể thu hồi tin nhắn. Vui lòng thử lại.")
    }
  }

  // Hàm mở gallery ảnh
  const openImageGallery = (images, initialIndex = 0) => {
    setGalleryImages(images)
    setGalleryInitialIndex(initialIndex)
    setGalleryVisible(true)
  }

  // Hàm xử lý khi nhấn vào một ảnh trong nhóm ảnh
  const handleImageGroupPress = (message, index) => {
    // Tạo mảng URLs từ attachments
    const imageUrls = message.attachments.map((attachment) => attachment.url)
    openImageGallery(imageUrls, index)
  }

  // Hàm xử lý khi nhấn vào một ảnh đơn
  const handleSingleImagePress = (imageUrl) => {
    openImageGallery([imageUrl])
  }

  // Thay đổi hàm handleImageUpload để xử lý ảnh tốt hơn
  const handleImageUpload = async () => {
    try {
      // Close the attachment options
      setShowAttachmentOptions(false)

      // Kiểm tra quyền truy cập
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào thư viện ảnh để gửi hình ảnh.")
        return
      }

      // Hiển thị thông báo đang chọn ảnh
      Alert.alert("Đang mở thư viện ảnh", "Vui lòng đợi trong giây lát...")

      // Use ImagePicker to select an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      })

      console.log("Image picker result:", result)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Hiển thị thông báo đang xử lý
        Alert.alert("Đang xử lý", "Đang chuẩn bị gửi hình ảnh...")

        // Nếu chọn nhiều ảnh
        if (result.assets.length > 1) {
          // Tạo attachments từ các ảnh đã chọn
          const attachments = result.assets.map((asset) => ({
            url: asset.uri,
            type: "image/jpeg",
            name: asset.uri.split("/").pop() || "image.jpg",
            size: asset.fileSize || 100000,
            _id: Date.now() + Math.random().toString(),
          }))

          // Optimistically add image group message to UI
          const currentTime = new Date()
          const newMessage = {
            messageId: `temp-${Date.now()}`,
            content: "",
            timestamp: currentTime,
            senderId: currentUser?.userId,
            type: "imageGroup",
            attachments: attachments,
            isDeleted: false,
            isRecalled: false,
            createdAt: currentTime.toISOString(),
          }

          setMessages([newMessage, ...messages])

          // Trong ứng dụng thực tế, bạn sẽ gửi các ảnh lên server
          // Ở đây chúng ta giả định rằng đã gửi thành công
          setTimeout(() => {
            // Cập nhật tin nhắn tạm thời với ID thực tế
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.messageId === newMessage.messageId ? { ...newMessage, messageId: `img-group-${Date.now()}` } : msg,
              ),
            )
            Alert.alert("Thành công", "Đã gửi nhóm hình ảnh thành công!")
          }, 1000)
        } else {
          // Nếu chỉ chọn một ảnh
          const imageUri = result.assets[0].uri
          console.log("Selected image URI:", imageUri)

          // Optimistically add image message to UI
          const currentTime = new Date()
          const newMessage = {
            messageId: `temp-${Date.now()}`,
            content: "",
            type: "image",
            attachments: [
              {
                url: imageUri,
                type: "image/jpeg",
                name: imageUri.split("/").pop() || "image.jpg",
                size: result.assets[0].fileSize || 100000,
                _id: Date.now() + Math.random().toString(),
              },
            ],
            timestamp: currentTime,
            senderId: currentUser?.userId,
            isDeleted: false,
            isRecalled: false,
            createdAt: currentTime.toISOString(),
          }

          setMessages([newMessage, ...messages])

          // Trong ứng dụng thực tế, bạn sẽ gửi ảnh lên server
          // Ở đây chúng ta giả định rằng đã gửi thành công
          setTimeout(() => {
            // Cập nhật tin nhắn tạm thời với ID thực tế
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.messageId === newMessage.messageId ? { ...newMessage, messageId: `img-${Date.now()}` } : msg,
              ),
            )
            Alert.alert("Thành công", "Đã gửi hình ảnh thành công!")
          }, 1000)
        }
      }
    } catch (err) {
      console.error("Error sending image message:", err)
      Alert.alert("Lỗi", `Không thể gửi hình ảnh. Lỗi: ${err.message}`)
    }
  }

  // Thay đổi hàm handleFileUpload để xử lý file tốt hơn
  const handleFileUpload = async () => {
    try {
      // Close the attachment options
      setShowAttachmentOptions(false)

      Alert.alert("Chọn nguồn file", "Bạn muốn chọn file từ đâu?", [
        {
          text: "Thư viện ảnh",
          onPress: async () => {
            try {
              // Kiểm tra quyền truy cập
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
              if (status !== "granted") {
                Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào thư viện ảnh để chọn file.")
                return
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 1,
              })

              console.log("Image picker result for file:", result)

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri
                const fileName = fileUri.split("/").pop() || "file.pdf"
                const fileSize = result.assets[0].fileSize || 1000000
                const fileType = result.assets[0].mimeType || "application/pdf"

                console.log("Selected file details:", { fileUri, fileName, fileSize, fileType })

                // Tạo attachment cho file
                const attachment = {
                  url: fileUri,
                  type: fileType,
                  name: fileName,
                  size: fileSize,
                  _id: Date.now() + Math.random().toString(),
                }

                // Optimistically add file message to UI
                const currentTime = new Date()
                const newMessage = {
                  messageId: `temp-${Date.now()}`,
                  content: "",
                  type: "file",
                  attachments: [attachment],
                  timestamp: currentTime,
                  senderId: currentUser?.userId,
                  isDeleted: false,
                  isRecalled: false,
                  createdAt: currentTime.toISOString(),
                }

                setMessages([newMessage, ...messages])

                // Trong ứng dụng thực tế, bạn sẽ gửi file lên server
                // Ở đây chúng ta giả định rằng đã gửi thành công
                setTimeout(() => {
                  // Cập nhật tin nhắn tạm thời với ID thực tế
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.messageId === newMessage.messageId ? { ...newMessage, messageId: `file-${Date.now()}` } : msg,
                    ),
                  )
                  Alert.alert("Thành công", "Đã gửi file thành công!")
                }, 1000)
              }
            } catch (err) {
              console.error("Error picking image as file:", err)
              Alert.alert("Lỗi", `Không thể chọn file từ thư viện ảnh. Lỗi: ${err.message}`)
            }
          },
        },
        {
          text: "Chọn từ Files",
          onPress: async () => {
            try {
              // Hiển thị thông báo đang mở trình chọn file
              Alert.alert("Đang mở trình chọn file", "Vui lòng đợi trong giây lát...")

              // Sử dụng DocumentPicker để chọn file từ hệ thống
              const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // Cho phép tất cả các loại file
                copyToCacheDirectory: true,
              })

              console.log("Document picker result:", result)

              if (result.canceled === false && result.assets && result.assets.length > 0) {
                const file = result.assets[0]
                console.log("Selected file:", file)

                // Tạo attachment cho file
                const attachment = {
                  url: file.uri,
                  type: file.mimeType || "application/octet-stream",
                  name: file.name || "file",
                  size: file.size || 1000000,
                  _id: Date.now() + Math.random().toString(),
                }

                // Optimistically add file message to UI
                const currentTime = new Date()
                const newMessage = {
                  messageId: `temp-${Date.now()}`,
                  content: "",
                  type: "file",
                  attachments: [attachment],
                  timestamp: currentTime,
                  senderId: currentUser?.userId,
                  isDeleted: false,
                  isRecalled: false,
                  createdAt: currentTime.toISOString(),
                }

                setMessages([newMessage, ...messages])

                // Trong ứng dụng thực tế, bạn sẽ gửi file lên server
                // Ở đây chúng ta giả định rằng đã gửi thành công
                setTimeout(() => {
                  // Cập nhật tin nhắn tạm thời với ID thực tế
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.messageId === newMessage.messageId ? { ...newMessage, messageId: `file-${Date.now()}` } : msg,
                    ),
                  )
                  Alert.alert("Thành công", "Đã gửi file thành công!")
                }, 1000)
              } else {
                console.log("Document picking canceled or failed")
                Alert.alert("Thông báo", "Bạn đã hủy chọn file hoặc có lỗi xảy ra.")
              }
            } catch (err) {
              console.error("Error picking document:", err)
              Alert.alert("Lỗi", `Không thể chọn file. Lỗi: ${err.message}`)
            }
          },
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ])
    } catch (err) {
      console.error("Error handling file:", err)
      Alert.alert("Lỗi", `Không thể xử lý tập tin. Lỗi: ${err.message}`)
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "Unknown size"

    bytes = Number(bytes)
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Check if the message is just a single emoji
  const isSingleEmoji = (text) => {
    // This regex matches a single emoji character
    const emojiRegex = /^[\p{Emoji}]$/u
    return emojiRegex.test(text)
  }

  // Process messages to determine which ones should show avatar and time
  const processedMessages = React.useMemo(() => {
    if (!messages || !currentUser) return []

    return messages.map((message, index) => {
      // Determine if this message is from the current user
      const isMe = message.senderId === currentUser.userId

      // Check if this message is from the same sender as the next one
      // Since the list is inverted, we check the next index (which is actually the previous message in time)
      const nextMessage = messages[index + 1]
      const isFirstInSequence = !nextMessage || nextMessage.senderId !== message.senderId

      // Check if this message is the last in a sequence from the same sender
      const prevMessage = messages[index - 1]
      const isLastInSequence = !prevMessage || prevMessage.senderId !== message.senderId

      // Determine if we should show the time
      let showTime = false

      // Always show time for the first message in the chat
      if (index === messages.length - 1) {
        showTime = true
      }
      // Show time if selected by user
      else if (message.messageId === selectedMessageId) {
        showTime = true
      }
      // Show time if more than 15 minutes have passed since the previous message
      else if (nextMessage) {
        // Calculate time difference in minutes
        const diffInMinutes = Math.floor((new Date(message.createdAt) - new Date(nextMessage.createdAt)) / (1000 * 60))

        // Show time if more than 15 minutes have passed
        if (diffInMinutes > 15) {
          showTime = true
        }
      }

      // Format the time string based on how old the message is
      const formattedTime = formatMessageTime(message.createdAt)

      return {
        ...message,
        isMe,
        isFirstInSequence,
        isLastInSequence,
        showTime,
        formattedTime,
      }
    })
  }, [messages, selectedMessageId, currentUser])

  const renderMessage = ({ item }) => {
    // If message is deleted or recalled, show special message
    if (item.isDeleted) {
      return (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
          <View style={[styles.messageBubble, styles.deletedMessageBubble]}>
            <Text style={styles.deletedMessageText}>Tin nhắn đã bị xóa</Text>
          </View>
        </View>
      )
    }

    if (item.isRecalled) {
      return (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
          <View style={[styles.messageBubble, styles.recalledMessageBubble]}>
            <Text style={styles.recalledMessageText}>Tin nhắn đã bị thu hồi</Text>
          </View>
        </View>
      )
    }

    // Check if the message is just a single emoji
    const singleEmoji = item.type === "emoji" || isSingleEmoji(item.content)

    // Handle image group messages
    if (item.type === "imageGroup" && item.attachments && item.attachments.length > 0) {
      return (
        <TouchableOpacity
          style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}
          onLongPress={() => handleLongPress(item)}
        >
          {!item.isMe && item.isFirstInSequence && (
            <Image
              source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
              style={styles.messageAvatar}
            />
          )}
          {!item.isMe && !item.isFirstInSequence && <View style={styles.avatarPlaceholder} />}

          <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.theirBubble, styles.imageBubble]}>
            {item.replyTo && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyName}>{item.replyTo.sender?.name || "Unknown"}</Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.content}
                </Text>
              </View>
            )}

            <ImageGroupPreview attachments={item.attachments} onPress={(index) => handleImageGroupPress(item, index)} />

            {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
          </View>
        </TouchableOpacity>
      )
    }

    // Handle single image messages
    if (
      item.type === "image" ||
      (item.attachments && item.attachments.length === 1 && item.attachments[0].type.startsWith("image/"))
    ) {
      const imageUrl = item.attachments ? item.attachments[0].url : item.imageUrl || item.content

      return (
        <TouchableOpacity
          style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}
          onPress={() => handleSingleImagePress(imageUrl)}
          onLongPress={() => handleLongPress(item)}
        >
          {!item.isMe && item.isFirstInSequence && (
            <Image
              source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
              style={styles.messageAvatar}
            />
          )}
          {!item.isMe && !item.isFirstInSequence && <View style={styles.avatarPlaceholder} />}

          <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.theirBubble, styles.imageBubble]}>
            {item.replyTo && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyName}>{item.replyTo.sender?.name || "Unknown"}</Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.content}
                </Text>
              </View>
            )}
            <Image
              source={{ uri: imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
              // Thêm fallback khi ảnh không tải được
              onError={(e) => {
                console.log("Image failed to load:", e.nativeEvent.error)
              }}
              defaultSource={require("../assets/icon.png")} // Ảnh mặc định khi không tải được
            />
            {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
          </View>
        </TouchableOpacity>
      )
    }

    // Handle file messages
    if (
      item.type === "file" ||
      (item.attachments && item.attachments.length > 0 && !item.attachments[0].type.startsWith("image/"))
    ) {
      const attachment = item.attachments ? item.attachments[0] : null
      const fileName = attachment ? attachment.name : item.fileName || "File"
      const fileUrl = attachment ? attachment.url : item.content || ""
      const fileType = attachment ? attachment.type : "application/octet-stream"
      const fileSize = attachment ? attachment.size : item.fileSize || "Unknown size" // Declare fileSize here
      const fileExtension = fileName.split(".").pop().toUpperCase()

      return (
        <TouchableOpacity
          style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}
          onPress={() => handleFilePress(fileUrl, fileName, fileType)}
          onLongPress={() => handleLongPress(item)}
        >
          {!item.isMe && item.isFirstInSequence && (
            <Image
              source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
              style={styles.messageAvatar}
            />
          )}
          {!item.isMe && !item.isFirstInSequence && <View style={styles.avatarPlaceholder} />}

          <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.theirBubble]}>
            {item.replyTo && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyName}>{item.replyTo.sender?.name || "Unknown"}</Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.content}
                </Text>
              </View>
            )}
            <View style={styles.fileContainer}>
              <View style={styles.fileIconContainer}>
                <Text style={styles.fileExtension}>{fileExtension}</Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(fileSize)}</Text>
              </View>
            </View>
            {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
          </View>
        </TouchableOpacity>
      )
    }

    // Default: text or emoji messages
    return (
      <TouchableOpacity
        style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}
        onPress={() => handleMessagePress(item.messageId)}
        onLongPress={() => handleLongPress(item)}
      >
        {!item.isMe && item.isFirstInSequence && (
          <Image
            source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
            style={styles.messageAvatar}
          />
        )}
        {!item.isMe && !item.isFirstInSequence && <View style={styles.avatarPlaceholder} />}

        <View
          style={[
            styles.messageBubble,
            item.isMe ? styles.myBubble : styles.theirBubble,
            singleEmoji && styles.emojiOnlyBubble,
          ]}
        >
          {item.replyTo && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyName}>{item.replyTo.sender?.name || "Unknown"}</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {item.replyTo.content}
              </Text>
            </View>
          )}
          <Text style={[styles.messageText, singleEmoji && styles.emojiOnlyText]}>{item.content}</Text>
          {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  // Thay đổi hàm handleFilePress để mở file tốt hơn
  const handleFilePress = async (fileUrl, fileName, fileType) => {
    try {
      // Kiểm tra xem URL có hợp lệ không
      if (!fileUrl) {
        throw new Error("URL file không hợp lệ")
      }

      console.log("Opening file:", { fileUrl, fileName, fileType })

      // Hiển thị thông báo đang mở file
      Alert.alert("Đang mở file", `Đang mở "${fileName}"...`)

      // Kiểm tra xem thiết bị có thể mở URL này không
      const canOpen = await Linking.canOpenURL(fileUrl)

      if (canOpen) {
        // Mở file bằng ứng dụng mặc định
        await Linking.openURL(fileUrl)
      } else {
        // Nếu không thể mở trực tiếp, hiển thị thông tin chi tiết về file
        Alert.alert("Không thể mở file", `Không tìm thấy ứng dụng nào có thể mở file "${fileName}".`, [
          {
            text: "Đóng",
            style: "cancel",
          },
          {
            text: "Xem thông tin",
            onPress: () => {
              Alert.alert("Thông tin file", `Tên: ${fileName}\nLoại: ${fileType}\nĐường dẫn: ${fileUrl}`, [
                { text: "OK" },
              ])
            },
          },
        ])
      }
    } catch (error) {
      console.error("Error opening file:", error)
      Alert.alert("Lỗi", `Không thể mở file. Lỗi: ${error.message}`, [{ text: "OK" }])
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0068FF" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
          style={styles.headerAvatar}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.contactName}>{conversation.name}</Text>
          <Text style={styles.status}>{conversation.online ? "Online" : "Đang hoạt động"}</Text>
        </View>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={processedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId.toString()}
        contentContainerStyle={styles.messagesList}
        inverted
        style={styles.chatBackground}
        refreshing={loading}
        onRefresh={fetchMessages}
      />

      {replyingToMessage && (
        <View style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <View style={styles.replyBarLine} />
            <View style={styles.replyBarTextContainer}>
              <Text style={styles.replyBarName}>
                {replyingToMessage.senderId === currentUser?.userId ? "Bạn" : conversation.name}
              </Text>
              <Text style={styles.replyBarText} numberOfLines={1}>
                {replyingToMessage.content}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.replyBarCloseButton} onPress={handleCancelReply}>
            <Ionicons name="close" size={20} color="#888888" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachmentButton} onPress={toggleAttachmentOptions}>
          <Ionicons name="add-circle-outline" size={28} color="#0068FF" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#888888"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />

        {inputText.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
            {sending ? (
              <ActivityIndicator size="small" color="#0068FF" />
            ) : (
              <Ionicons name="send" size={24} color="#0068FF" />
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mic-outline" size={24} color="#0068FF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleEmojiPicker}>
              <Ionicons name={showEmojiPicker ? "happy" : "happy-outline"} size={24} color="#0068FF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {showEmojiPicker && <EmojiPicker onEmojiSelected={handleSendEmoji} />}

      {showAttachmentOptions && (
        <View style={styles.attachmentOptionsContainer}>
          <View style={styles.attachmentOptionsRow}>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleImageUpload}>
              <View style={[styles.attachmentIconContainer, { backgroundColor: "#4CAF50" }]}>
                <Ionicons name="image-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentOptionText}>Hình ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={handleFileUpload}>
              <View style={[styles.attachmentIconContainer, { backgroundColor: "#FF9800" }]}>
                <Ionicons name="document-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentOptionText}>Tài liệu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption}>
              <View style={[styles.attachmentIconContainer, { backgroundColor: "#E91E63" }]}>
                <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentOptionText}>Máy ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ImageGallery
        images={galleryImages}
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        initialIndex={galleryInitialIndex}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0068FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  contactName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  headerRightIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: "flex-end",
  },
  chatBackground: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
  },
  myMessage: {
    justifyContent: "flex-end",
  },
  theirMessage: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 30,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: "#0068FF",
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: "#333333",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 12,
    color: "#A9A9A9",
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#333333",
    marginRight: 8,
  },
  attachmentButton: {
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 12,
  },
  replyBar: {
    backgroundColor: "#262626",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  replyBarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyBarLine: {
    width: 3,
    height: "100%",
    backgroundColor: "#0068FF",
    marginRight: 8,
  },
  replyBarTextContainer: {
    flex: 1,
  },
  replyBarName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  replyBarText: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  replyBarCloseButton: {
    padding: 5,
  },
  replyContainer: {
    backgroundColor: "#444444",
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
  },
  replyName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  replyText: {
    color: "#A9A9A9",
    fontSize: 12,
  },
  deletedMessageBubble: {
    backgroundColor: "#555555",
  },
  deletedMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
  },
  recalledMessageBubble: {
    backgroundColor: "#555555",
  },
  recalledMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
  },
  imageBubble: {
    padding: 0,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  imageGroupContainer: {
    flexDirection: "column",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridImageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  singleImageContainer: {
    width: 200,
    height: 150,
  },
  doubleImageContainer: {
    width: 150,
    height: 150,
  },
  multipleImageContainer: {
    width: 100,
    height: 100,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  remainingCountOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingCountText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  attachmentOptions: {
    flexDirection: "row",
    backgroundColor: "#262626",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#333333",
    justifyContent: "space-around",
  },
  attachmentOptionsContainer: {
    backgroundColor: "#262626",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  attachmentOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  attachmentOption: {
    alignItems: "center",
  },
  attachmentOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 5,
  },
  attachmentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiPickerContainer: {
    backgroundColor: "#262626",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    maxHeight: 200,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  emojiButton: {
    padding: 5,
  },
  emoji: {
    fontSize: 24,
  },
  emojiOnlyBubble: {
    backgroundColor: "#0068FF",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  emojiOnlyText: {
    fontSize: 28,
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  galleryCloseButton: {
    padding: 10,
  },
  galleryCounter: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  galleryImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: width,
    height: height * 0.7,
  },
  galleryControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  galleryControlButton: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444444",
    borderRadius: 8,
    padding: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555555",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  fileExtension: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  fileSize: {
    color: "#A9A9A9",
    fontSize: 12,
  },
})

export default ChatDetailScreen
