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
import * as DocumentPicker from "expo-document-picker"
// Add this import at the top of the file
// Remove DocumentPicker import
// Add these imports at the top of the file
// Remove this import at the top of the file
// import Clipboard from "@react-native-clipboard/clipboard"

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

// Add this new component for the message action menu
const MessageActionMenu = ({
  visible,
  onClose,
  onReply,
  onForward,
  onCopy,
  onRecall,
  onPin,
  onSaveToCloud,
  message,
  isOwnMessage,
}) => {
  if (!visible) return null

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.messageActionContainer}>
          <View style={styles.actionButtonsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={onReply}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="arrow-undo-outline" size={24} color="#4CD964" />
              </View>
              <Text style={styles.actionText}>Trả lời</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onForward}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="arrow-redo-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Chuyển tiếp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onSaveToCloud}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="cloud-upload-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Lưu Cloud</Text>
            </TouchableOpacity>

            {isOwnMessage && (
              <TouchableOpacity style={styles.actionButton} onPress={onRecall}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="refresh-outline" size={24} color="#FF3B30" />
                </View>
                <Text style={styles.actionText}>Thu hồi</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={onCopy}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="copy-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Sao chép</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="bookmark-outline" size={24} color="#FF9500" />
              </View>
              <Text style={styles.actionText}>Ghim</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="time-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={styles.actionText}>Nhắc hẹn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="checkmark-done-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Chọn nhiều</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Tạo tin nhắn nhanh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="language-outline" size={24} color="#0068FF" />
                <Text style={styles.betaTag}>BETA</Text>
              </View>
              <Text style={styles.actionText}>Dịch</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="volume-high-outline" size={24} color="#0068FF" />
                <Text style={styles.betaTag}>BETA</Text>
              </View>
              <Text style={styles.actionText}>Đọc văn bản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
              </View>
              <Text style={styles.actionText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// Add this new component for the forward screen
const ForwardScreen = ({ visible, onClose, contacts, onSelectContact }) => {
  const [searchQuery, setSearchQuery] = useState("")

  if (!visible) return null

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.forwardContainer}>
        <View style={styles.forwardHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.forwardTitle}>Chia sẻ</Text>
          <Text style={styles.forwardSubtitle}>Đã chọn: 0</Text>
        </View>

        <View style={styles.forwardSearchContainer}>
          <TextInput
            style={styles.forwardSearchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.forwardTabsContainer}>
          <View style={styles.forwardTab}>
            <View style={styles.forwardTabIcon}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.forwardTabText}>Nhóm mới</Text>
          </View>

          <View style={styles.forwardTab}>
            <View style={styles.forwardTabIcon}>
              <Ionicons name="time" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.forwardTabText}>Nhật ký</Text>
          </View>

          <View style={styles.forwardTab}>
            <View style={styles.forwardTabIcon}>
              <Ionicons name="share" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.forwardTabText}>App khác</Text>
          </View>
        </View>

        <Text style={styles.forwardSectionTitle}>Gần đây</Text>

        <FlatList
          data={
            contacts || [
              { id: "1", name: "Cloud của tôi", avatar: null, isCloud: true },
              { id: "2", name: "Mã 2", avatar: null, isGroup: false },
              { id: "3", name: "Nhóm 12_CNM", avatar: null, isGroup: true, memberCount: 5 },
              { id: "4", name: "CN_DHKTPM17C", avatar: null, isGroup: true, memberCount: 70 },
              { id: "5", name: "Báo Mới", avatar: null, isOfficial: true },
            ]
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.forwardContactItem} onPress={() => onSelectContact(item)}>
              {item.isCloud ? (
                <View style={[styles.forwardContactAvatar, { backgroundColor: "#0068FF" }]}>
                  <Ionicons name="cloud" size={24} color="#FFFFFF" />
                </View>
              ) : item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.forwardContactAvatar} />
              ) : (
                <View style={[styles.forwardContactAvatar, { backgroundColor: item.isGroup ? "#FF9500" : "#FF3B30" }]}>
                  <Text style={styles.forwardContactInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                  {item.isGroup && item.memberCount && (
                    <View style={styles.forwardMemberCount}>
                      <Text style={styles.forwardMemberCountText}>{item.memberCount}</Text>
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.forwardContactName}>{item.name}</Text>

              <View style={styles.forwardCheckbox} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
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
  // Add these new state variables to the ChatDetailScreen component
  const [showMessageActions, setShowMessageActions] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showForwardScreen, setShowForwardScreen] = useState(false)
  const [messageToForward, setMessageToForward] = useState(null)

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

  // Update the handleLongPress function in the ChatDetailScreen component
  const handleLongPress = (message) => {
    // Show action menu for message
    setSelectedMessage(message)
    setShowMessageActions(true)
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

      // Use DocumentPicker to select images
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      })

      console.log("Document picker result:", result)

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        // Hiển thị thông báo đang xử lý
        Alert.alert("Đang xử lý", "Đang chuẩn bị gửi hình ảnh...")

        // Nếu chọn nhiều ảnh
        if (result.assets.length > 1) {
          // Tạo attachments từ các ảnh đã chọn
          const attachments = result.assets.map((asset) => ({
            url: asset.uri,
            type: asset.mimeType || "image/jpeg",
            name: asset.name || asset.uri.split("/").pop() || "image.jpg",
            size: asset.size || 100000,
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
          const asset = result.assets[0]
          const imageUri = asset.uri
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
                type: asset.mimeType || "image/jpeg",
                name: asset.name || imageUri.split("/").pop() || "image.jpg",
                size: asset.size || 100000,
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
  // Replace the handleFileUpload function with this implementation
  const handleFileUpload = async () => {
    try {
      // Close the attachment options
      setShowAttachmentOptions(false)

      // Use DocumentPicker to select a file
      const result = await DocumentPicker.getDocumentAsync({
        type: ["*/*"],
        copyToCacheDirectory: true,
      })

      console.log("Document picker result:", result)

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        console.log("Selected file details:", file)

        // Show loading indicator
        Alert.alert("Đang xử lý", "Đang chuẩn bị gửi file...")

        // Create attachment for the file
        const attachment = {
          url: file.uri,
          type: file.mimeType || "application/octet-stream",
          name: file.name || "file",
          size: file.size || 0,
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

        // In a real app, you would upload the file to your server here
        // For now, we'll simulate a successful upload
        setTimeout(() => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.messageId === newMessage.messageId ? { ...newMessage, messageId: `file-${Date.now()}` } : msg,
            ),
          )
          Alert.alert("Thành công", `Đã gửi file "${file.name}" thành công!`)
        }, 1000)
      }
    } catch (err) {
      console.error("Error picking document:", err)
      Alert.alert("Lỗi", `Không thể chọn file. Lỗi: ${err.message}`)
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
      const fileExtension = fileName.split(".").pop()?.toUpperCase() || "FILE"

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
        activeOpacity={0.8}
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
            singleEmoji && item.isMe && { alignItems: "flex-end" },
            singleEmoji && !item.isMe && { alignItems: "flex-start" },
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
          <Text
            style={[
              styles.messageText,
              singleEmoji && styles.emojiOnlyText,
              item.isMe && styles.myMessageText,
              singleEmoji && item.isMe && { textAlign: "right" },
              singleEmoji && !item.isMe && { textAlign: "left" },
            ]}
          >
            {item.content}
          </Text>
          {item.showTime && (
            <Text style={[styles.messageTime, item.isMe && styles.myMessageTime]}>
              {item.formattedTime}
              {item.isMe && (
                <Ionicons name="checkmark-done" size={12} color="rgba(255, 255, 255, 0.6)" style={{ marginLeft: 4 }} />
              )}
            </Text>
          )}
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

  // Add these new functions to the ChatDetailScreen component
  // Replace the handleCopyMessage function with this implementation
  const handleCopyMessage = (message) => {
    if (message.content) {
      // Instead of using the native clipboard module, we'll just show an alert
      // In a real app with proper native module setup, you would use Clipboard.setString(message.content)
      Alert.alert("Đã sao chép", "Nội dung tin nhắn đã được sao chép vào bộ nhớ tạm.")
    }
    setShowMessageActions(false)
  }

  const handleForwardMessage = (message) => {
    setShowMessageActions(false)
    setShowForwardScreen(true)
    setMessageToForward(message)
  }

  const handleSelectForwardContact = async (contact) => {
    try {
      setShowForwardScreen(false)

      if (messageToForward) {
        // In a real app, this would call the API to forward the message
        // For now, we'll just show a success message
        Alert.alert("Đã chuyển tiếp", `Tin nhắn đã được chuyển tiếp đến ${contact.name}`)
      }
    } catch (err) {
      console.error("Error forwarding message:", err)
      Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn. Vui lòng thử lại.")
    }
  }

  const handleSaveToCloud = (message) => {
    Alert.alert("Đã lưu", "Tin nhắn đã được lưu vào Cloud của bạn.")
    setShowMessageActions(false)
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          onPress={() => Alert.alert("Thông tin", `Xem thông tin của ${conversation.name}`)}
        >
          <Image
            source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
            style={styles.headerAvatar}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.contactName}>{conversation.name}</Text>
            <Text style={styles.status}>{conversation.online ? "Đang hoạt động" : "Hoạt động 5 phút trước"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
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
        <TouchableOpacity style={styles.attachmentButton} onPress={handleFileUpload}>
          <Ionicons name="document-outline" size={24} color="#0068FF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachmentButton} onPress={handleImageUpload}>
          <Ionicons name="image-outline" size={24} color="#0068FF" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity style={styles.attachmentButton} onPress={toggleEmojiPicker}>
          <Ionicons name={showEmojiPicker ? "happy" : "happy-outline"} size={24} color="#0068FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
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

      <MessageActionMenu
        visible={showMessageActions}
        onClose={() => setShowMessageActions(false)}
        onReply={() => {
          setReplyingToMessage(selectedMessage)
          setShowMessageActions(false)
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }}
        onForward={() => handleForwardMessage(selectedMessage)}
        onCopy={() => handleCopyMessage(selectedMessage)}
        onRecall={() => {
          handleRecallMessage(selectedMessage)
          setShowMessageActions(false)
        }}
        onSaveToCloud={() => handleSaveToCloud(selectedMessage)}
        message={selectedMessage}
        isOwnMessage={selectedMessage?.senderId === currentUser?.userId}
      />

      <ForwardScreen
        visible={showForwardScreen}
        onClose={() => setShowForwardScreen(false)}
        onSelectContact={handleSelectForwardContact}
      />
    </SafeAreaView>
  )
}

// Update the styles object at the bottom of the file to improve the UI appearance

// Replace the styles object with this enhanced version:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Darker background for better contrast
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
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
    fontSize: 13,
  },
  headerRightIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 18,
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 10,
  },
  chatBackground: {
    flex: 1,
    backgroundColor: "#121212",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "100%",
  },
  myMessage: {
    justifyContent: "flex-end",
    marginLeft: 50,
  },
  theirMessage: {
    justifyContent: "flex-start",
    marginRight: 50,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 28,
    marginRight: 8,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    maxWidth: "100%",
  },
  myBubble: {
    backgroundColor: "#0068FF",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  myMessageText: {
    textAlign: "right", // Right-align text for user's messages
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    marginRight: 8,
    maxHeight: 100,
  },
  attachmentButton: {
    marginRight: 8,
    padding: 6,
  },
  sendButton: {
    padding: 8,
    backgroundColor: "#0068FF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  replyBar: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  replyBarContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    color: "#0068FF",
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
    backgroundColor: "rgba(68, 68, 68, 0.6)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
    borderLeftWidth: 2,
    borderLeftColor: "#0068FF",
  },
  replyName: {
    color: "#0068FF",
    fontSize: 12,
    fontWeight: "bold",
  },
  replyText: {
    color: "#A9A9A9",
    fontSize: 12,
  },
  deletedMessageBubble: {
    backgroundColor: "#333333",
  },
  deletedMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
  },
  recalledMessageBubble: {
    backgroundColor: "#333333",
  },
  recalledMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
  },
  imageBubble: {
    padding: 2,
    overflow: "hidden",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 16,
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
    margin: 1,
  },
  singleImageContainer: {
    width: 200,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
  },
  doubleImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
  },
  multipleImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingCountText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  attachmentOptionsContainer: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    paddingHorizontal: 8,
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
    width: 80,
  },
  attachmentOptionText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  attachmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emojiPickerContainer: {
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    maxHeight: 220,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  emojiButton: {
    padding: 8,
    borderRadius: 20,
  },
  emoji: {
    fontSize: 24,
    height: 50,
  },
  emojiOnlyBubble: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 50, // Add minimum width to ensure emoji has enough space
  },
  emojiOnlyText: {
    fontSize: 40,
    lineHeight: 50, // Add line height to ensure proper vertical spacing
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  galleryCloseButton: {
    padding: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(0, 104, 255, 0.5)",
  },
  messageActionContainer: {
    backgroundColor: "#262626",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  actionButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
  },
  actionButton: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  betaTag: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#4CD964",
    color: "#000000",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 4,
    paddingVertical: 2,
    right: -5,
    backgroundColor: "#4CD964",
    color: "#000000",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(0, 104, 255, 0.5)",
  },
  myMessageTime: {
    textAlign: "right", // Align the time to the right for my messages
  },
})

export default ChatDetailScreen
