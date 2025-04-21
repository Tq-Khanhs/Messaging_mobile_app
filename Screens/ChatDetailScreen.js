"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { userService } from "../services/userService"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import * as Clipboard from "expo-clipboard"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as MediaLibrary from "expo-media-library"
import { friendService } from "../services/friendService"

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
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [lastScale, setLastScale] = useState(1)
  const [lastTranslateX, setLastTranslateX] = useState(0)
  const [lastTranslateY, setLastTranslateY] = useState(0)
  const [pinchStartDistance, setPinchStartDistance] = useState(0)
  const [doubleTapTimeout, setDoubleTapTimeout] = useState(null)
  const [lastTapTimestamp, setLastTapTimestamp] = useState(0)

  // Reset transformations when changing images
  useEffect(() => {
    resetTransformations()
  }, [currentIndex])

  // Reset transformations when closing the gallery
  useEffect(() => {
    if (!visible) {
      resetTransformations()
    }
  }, [visible])

  const resetTransformations = () => {
    setScale(1)
    setTranslateX(0)
    setTranslateY(0)
    setLastScale(1)
    setLastTranslateX(0)
    setLastTranslateY(0)
  }

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

  // Handle pinch to zoom
  const handlePinchStart = (event) => {
    if (event.nativeEvent.touches.length === 2) {
      const touch1 = event.nativeEvent.touches[0]
      const touch2 = event.nativeEvent.touches[1]
      const distance = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2))
      setPinchStartDistance(distance)
    }
  }

  const handlePinchMove = (event) => {
    if (event.nativeEvent.touches.length === 2) {
      const touch1 = event.nativeEvent.touches[0]
      const touch2 = event.nativeEvent.touches[1]
      const distance = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2))

      if (pinchStartDistance > 0) {
        const newScale = Math.max(1, Math.min(5, lastScale * (distance / pinchStartDistance)))
        setScale(newScale)
      }
    }
  }

  const handlePinchEnd = () => {
    setLastScale(scale)
    setPinchStartDistance(0)
  }

  // Handle pan (drag) when zoomed in
  const handlePanStart = (event) => {
    if (scale > 1 && event.nativeEvent.touches.length === 1) {
      setLastTranslateX(translateX)
      setLastTranslateY(translateY)
    }
  }

  const handlePanMove = (event) => {
    if (scale > 1 && event.nativeEvent.touches.length === 1) {
      const touch = event.nativeEvent.touches[0]
      const dx = touch.pageX - event.nativeEvent.touches[0].locationX
      const dy = touch.pageY - event.nativeEvent.touches[0].locationY

      // Calculate boundaries to prevent dragging outside the image
      const maxTranslateX = ((scale - 1) * width) / 2
      const maxTranslateY = ((scale - 1) * height) / 2

      const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, lastTranslateX + dx))
      const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, lastTranslateY + dy))

      setTranslateX(newTranslateX)
      setTranslateY(newTranslateY)
    }
  }

  // Handle double tap to zoom
  const handleDoubleTap = (event) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300 // ms

    if (now - lastTapTimestamp < DOUBLE_TAP_DELAY) {
      // Double tap detected
      clearTimeout(doubleTapTimeout)

      if (scale > 1) {
        // If already zoomed in, reset to normal
        resetTransformations()
      } else {
        // Zoom in to 2x at the tap location
        const tapX = event.nativeEvent.locationX
        const tapY = event.nativeEvent.locationY

        // Calculate the center point of the screen
        const centerX = width / 2
        const centerY = height / 2

        // Calculate the offset from center
        const offsetX = (tapX - centerX) * 0.5
        const offsetY = (tapY - centerY) * 0.5

        setScale(2)
        setTranslateX(offsetX)
        setTranslateY(offsetY)
        setLastScale(2)
        setLastTranslateX(offsetX)
        setLastTranslateY(offsetY)
      }

      setLastTapTimestamp(0) // Reset
    } else {
      // First tap
      setLastTapTimestamp(now)

      // Set a timeout to detect if it's a single tap
      const timeout = setTimeout(() => {
        setLastTapTimestamp(0)
      }, DOUBLE_TAP_DELAY)

      setDoubleTapTimeout(timeout)
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

        <View
          style={styles.galleryImageContainer}
          onTouchStart={handlePanStart}
          onTouchMove={handlePanMove}
          onResponderStart={handlePinchStart}
          onResponderMove={handlePinchMove}
          onResponderRelease={handlePinchEnd}
        >
          <TouchableWithoutFeedback onPress={handleDoubleTap}>
            <Image
              source={{ uri: images[currentIndex]?.url || images[currentIndex] }}
              style={[
                styles.galleryImage,
                {
                  transform: [{ scale: scale }, { translateX: translateX }, { translateY: translateY }],
                },
              ]}
              resizeMode="contain"
            />
          </TouchableWithoutFeedback>
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
const isSingleEmoji = (text) => {
  // This regex matches a single emoji character
  const emojiRegex = /^[\p{Emoji}]$/u
  return emojiRegex.test(text)
}

// Add this new component for the message action menu
const MessageActionMenu = ({ visible, onClose, onForward, onCopy, onRecall, onDelete, message, isOwnMessage }) => {
  if (!visible) return null
  const showCopyOption =
    message && (message.type === "text" || message.type === "emoji" || isSingleEmoji(message.content))

  const copyLabel = message.type === "image" ? "Copy Image" : "Sao chép"

  const handleCopyMessage = async (message) => {
    try {
      if (message.type === "text" || message.type === "emoji" || isSingleEmoji(message.content)) {
        await Clipboard.setStringAsync(message.content)
        Alert.alert("Đã sao chép", "Tin nhắn đã được sao chép vào bộ nhớ tạm.")
      }
      onClose()
    } catch (error) {
      console.error("Copy error:", error)
      Alert.alert("Lỗi", "Không thể sao chép tin nhắn")
    }
  }

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.messageActionContainer}>
          <View style={styles.actionButtonsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={onForward}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="arrow-redo-outline" size={24} color="#0068FF" />
              </View>
              <Text style={styles.actionText}>Chuyển tiếp</Text>
            </TouchableOpacity>

            {isOwnMessage && (
              <TouchableOpacity style={styles.actionButton} onPress={onRecall}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="refresh-outline" size={24} color="#FF3B30" />
                </View>
                <Text style={styles.actionText}>Thu hồi</Text>
              </TouchableOpacity>
            )}

            {showCopyOption && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  handleCopyMessage(message)
                  onClose()
                }}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="copy-outline" size={24} color="#0068FF" />
                </View>
                <Text style={styles.actionText}>{copyLabel}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={styles.actionText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// Update the ForwardScreen component to properly handle message forwarding
const ForwardScreen = ({ visible, onClose, contacts, onSelectContact, messageToForward }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [selectedConversationIds, setSelectedConversationIds] = useState([]) // Track selected conversation IDs
  const [groups, setGroups] = useState([
    {
      id: "group1",
      name: "Nhóm 12_CNM",
      avatar: null,
      isGroup: true,
      memberCount: 5,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group2",
      name: "DHTH17F",
      avatar: require("../assets/icon.png"),
      isGroup: true,
    },
    {
      id: "group3",
      name: "CN_DHKTPM17C",
      avatar: null,
      isGroup: true,
      memberCount: 70,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group4",
      name: "nhóm.học triết 5F🦄",
      avatar: null,
      isGroup: true,
      memberCount: 10,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group5",
      name: "Nhóm GDTC ca 2 lớp DHTH17B IUH",
      avatar: null,
      isGroup: true,
      memberCount: 30,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
  ])

  // State for friends data
  const [friendsData, setFriendsData] = useState({})
  const [sortedLetters, setSortedLetters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false) // Track sending state

  // Fetch friends data when the component becomes visible
  useEffect(() => {
    if (visible) {
      fetchFriends()
    }
  }, [visible])

  // Function to fetch friends from friendService
  const fetchFriends = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get friends from the friendService
      const friends = await friendService.getFriends()

      // Process friends data into alphabetical sections
      const groupedFriends = processFriendsData(friends)
      setFriendsData(groupedFriends)

      // Sort letters alphabetically
      const letters = Object.keys(groupedFriends).sort()
      setSortedLetters(letters)
    } catch (err) {
      console.error("Error fetching friends for forward screen:", err)
      setError("Không thể tải danh sách bạn bè")
    } finally {
      setLoading(false)
    }
  }

  // Process friends data into alphabetical sections
  const processFriendsData = (friends) => {
    if (!friends || !Array.isArray(friends)) return {}

    // Group friends by first letter of name
    const sections = {}

    friends.forEach((friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase()

      if (!sections[firstLetter]) {
        sections[firstLetter] = []
      }

      sections[firstLetter].push({
        id: friend.userId,
        name: friend.fullName,
        avatar: friend.avatarUrl ? { uri: friend.avatarUrl } : null,
        letter: firstLetter,
        conversationId: friend.conversationId, // Store conversation ID if available
      })
    })

    return sections
  }

  const toggleSelectContact = (contact) => {
    // Check if contact is already selected
    if (selectedContacts.some((c) => c.id === contact.id)) {
      // Remove from selected contacts
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id))

      // Remove conversation ID if it exists
      if (contact.conversationId) {
        setSelectedConversationIds(selectedConversationIds.filter((id) => id !== contact.conversationId))
      }
    } else {
      // Add to selected contacts
      setSelectedContacts([...selectedContacts, contact])

      // Add conversation ID if it exists
      if (contact.conversationId) {
        setSelectedConversationIds([...selectedConversationIds, contact.conversationId])
      }
    }
  }

  const handleSend = async () => {
    if (selectedContacts.length === 0 || !messageToForward) return

    try {
      setIsSending(true)

      // Create an array to track successful forwards
      const successfulForwards = []
      const failedForwards = []

      // Forward the message to each selected conversation
      for (const contact of selectedContacts) {
        try {
          // First, get or create a conversation with this contact if needed
          let conversationId = contact.conversationId

          if (!conversationId) {
            // If no conversation ID exists, create one
            const conversation = await messageService.getOrStartConversation(contact.id)
            conversationId = conversation.conversationId
          }

          // Forward the message to this conversation
          await messageService.forwardMessage(messageToForward.messageId, conversationId)

          // Add to successful forwards
          successfulForwards.push(contact.name)
        } catch (err) {
          console.error(`Failed to forward message to ${contact.name}:`, err)
          failedForwards.push(contact.name)
        }
      }

      // Show success message
      if (successfulForwards.length > 0) {
        const message =
          successfulForwards.length === 1
            ? `Đã chuyển tiếp tin nhắn đến ${successfulForwards[0]}`
            : `Đã chuyển tiếp tin nhắn đến ${successfulForwards.length} người`

        Alert.alert("Thành công", message)
      }

      // Show error message if any forwards failed
      if (failedForwards.length > 0) {
        const message =
          failedForwards.length === 1
            ? `Không thể chuyển tiếp tin nhắn đến ${failedForwards[0]}`
            : `Không thể chuyển tiếp tin nhắn đến ${failedForwards.length} người`

        Alert.alert("Lỗi", message)
      }

      // Close the forward screen
      onClose()
    } catch (err) {
      console.error("Error forwarding messages:", err)
      Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn. Vui lòng thử lại.")
    } finally {
      setIsSending(false)
    }
  }

  // Filter friends and groups based on search query
  const filterItems = (items, query) => {
    if (!query) return items

    const lowercaseQuery = query.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(lowercaseQuery))
  }

  // Get the message content to display
  const getMessageContent = () => {
    if (!messageToForward) return ""

    if (
      messageToForward.type === "image" ||
      (messageToForward.attachments &&
        messageToForward.attachments.length > 0 &&
        messageToForward.attachments[0].type.startsWith("image/"))
    ) {
      return "[Hình ảnh]"
    } else if (
      messageToForward.type === "file" ||
      (messageToForward.attachments &&
        messageToForward.attachments.length > 0 &&
        !messageToForward.attachments[0].type.startsWith("image/"))
    ) {
      return "[File]"
    } else {
      return messageToForward.content || ""
    }
  }

  if (!visible) return null

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.forwardContainer}>
        <View style={styles.forwardHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.forwardHeaderTitle}>
            <Text style={styles.forwardTitle}>Chia sẻ</Text>
            <Text style={styles.forwardSubtitle}>Đã chọn: {selectedContacts.length}</Text>
          </View>
        </View>

        <View style={styles.forwardSearchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.forwardSearchIcon} />
          <TextInput
            style={styles.forwardSearchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.forwardLoadingContainer}>
            <ActivityIndicator size="large" color="#0068FF" />
          </View>
        ) : (
          <ScrollView style={styles.forwardScrollView}>
            {/* Groups Section */}
            <View style={styles.forwardSectionContainer}>
              <Text style={styles.forwardSectionTitle}>Nhóm trò chuyện</Text>

              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.forwardContactItem}
                  onPress={() => toggleSelectContact(group)}
                >
                  <View style={styles.groupAvatarContainer}>
                    {group.avatar ? (
                      <Image source={group.avatar} style={styles.forwardContactAvatar} />
                    ) : (
                      <View style={styles.groupAvatarsStack}>
                        {group.members &&
                          group.members
                            .slice(0, 3)
                            .map((member, index) => (
                              <Image
                                key={member.id}
                                source={member.avatar}
                                style={[
                                  styles.groupStackedAvatar,
                                  { top: index * 8, left: index * 8, zIndex: 3 - index },
                                ]}
                              />
                            ))}
                        {group.memberCount && (
                          <View style={styles.groupMemberCount}>
                            <Text style={styles.groupMemberCountText}>{group.memberCount}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  <Text style={styles.forwardContactName}>{group.name}</Text>

                  <View
                    style={[
                      styles.forwardCheckbox,
                      selectedContacts.some((c) => c.id === group.id) && styles.forwardCheckboxSelected,
                    ]}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.seeMoreButton}>
                <Text style={styles.seeMoreText}>Xem thêm</Text>
                <Ionicons name="chevron-forward" size={20} color="#0068FF" />
              </TouchableOpacity>
            </View>

            {/* Friends Section */}
            <View style={styles.forwardSectionContainer}>
              <Text style={styles.forwardSectionTitle}>Bạn bè</Text>

              {error ? (
                <View style={styles.forwardErrorContainer}>
                  <Text style={styles.forwardErrorText}>{error}</Text>
                  <TouchableOpacity style={styles.forwardRetryButton} onPress={fetchFriends}>
                    <Text style={styles.forwardRetryButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                sortedLetters.map((letter) => (
                  <View key={letter}>
                    <Text style={styles.alphabetHeader}>{letter}</Text>

                    {friendsData[letter].map((friend) => (
                      <TouchableOpacity
                        key={friend.id}
                        style={styles.forwardContactItem}
                        onPress={() => toggleSelectContact(friend)}
                      >
                        {friend.avatar ? (
                          <Image source={friend.avatar} style={styles.forwardContactAvatar} />
                        ) : (
                          <View style={[styles.forwardContactAvatar, { backgroundColor: "#FF3B30" }]}>
                            <Text style={styles.forwardContactInitial}>{friend.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        )}

                        <Text style={styles.forwardContactName}>{friend.name}</Text>

                        <View
                          style={[
                            styles.forwardCheckbox,
                            selectedContacts.some((c) => c.id === friend.id) && styles.forwardCheckboxSelected,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}

        <View style={styles.forwardFooter}>
          <View style={styles.forwardInputContainer}>
            <TextInput
              style={[styles.forwardMessageInput, { color: "#FFFFFF" }]}
              value={getMessageContent()}
              editable={false}
              multiline={true}
              numberOfLines={2}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.forwardSendButton,
              selectedContacts.length === 0 || isSending ? styles.forwardSendButtonDisabled : {},
            ]}
            onPress={handleSend}
            disabled={selectedContacts.length === 0 || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

// Update the ChatDetailScreen to handle group conversations
const ChatDetailScreen = ({ route, navigation }) => {
  const { conversation } = route.params || {
    name: "Nguyễn Minh Đức",
    avatar: require("../assets/icon.png"),
    online: false,
    isGroup: false,
    members: [],
  }

  // Add this function to render the group avatar in the header
  const renderHeaderAvatar = () => {
    if (!conversation.isGroup) {
      // Regular one-on-one conversation
      return (
        <Image
          source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
          style={styles.headerAvatar}
        />
      )
    }

    // Group conversation
    if (conversation.avatar) {
      // Group with custom avatar
      return <Image source={{ uri: conversation.avatar }} style={styles.headerAvatar} />
    }

    // Group without custom avatar - show member avatars in a grid
    return (
      <View style={styles.headerGroupAvatarGrid}>
        {conversation.members &&
          conversation.members
            .slice(0, 4)
            .map((member, index) => (
              <Image
                key={member.userId || index}
                source={member.avatarUrl ? { uri: member.avatarUrl } : require("../assets/icon.png")}
                style={[
                  styles.headerGroupMemberAvatar,
                  index === 0 && styles.headerTopLeftAvatar,
                  index === 1 && styles.headerTopRightAvatar,
                  index === 2 && styles.headerBottomLeftAvatar,
                  index === 3 && styles.headerBottomRightAvatar,
                ]}
              />
            ))}
        {(!conversation.members || conversation.members.length === 0) && (
          <View style={styles.headerGroupAvatarPlaceholder}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
        )}
      </View>
    )
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [sending, setSending] = useState(false)
  // Add these new state variables to the ChatDetailScreen component
  const [showMessageActions, setShowMessageActions] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showForwardScreen, setShowForwardScreen] = useState(false)
  const [messageToForward, setMessageToForward] = useState(null)
  // Add a new state to cache user details
  const [userCache, setUserCache] = useState({})

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

  // Add a function to fetch user details by userId
  const fetchUserDetails = async (userId) => {
    // If we already have this user in cache, return it
    if (userCache[userId]) {
      return userCache[userId]
    }

    try {
      // Fetch user details from API
      const user = await userService.getUserById(userId)

      // Update cache with the new user
      setUserCache((prevCache) => ({
        ...prevCache,
        [userId]: user,
      }))

      return user
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      return null
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
      // Show confirmation dialog before deleting
      Alert.alert("Xóa tin nhắn", "Bạn có chắc chắn muốn xóa tin nhắn này không?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setShowMessageActions(false)

              // Call the API to delete the message
              await messageService.deleteMessage(message.messageId)

              // Update the UI to show the message as deleted
              setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.messageId === message.messageId ? { ...msg, isDeleted: true } : msg)),
              )

              Alert.alert("Thành công", "Tin nhắn đã được xóa")
            } catch (err) {
              console.error("Error deleting message:", err)
              Alert.alert("Lỗi", "Không thể xóa tin nhắn. Vui lòng thử lại.")
            }
          },
        },
      ])
    } catch (err) {
      console.error("Error in delete message flow:", err)
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

  // Update the handleSingleImagePress function to properly handle image taps
  const handleSingleImagePress = (imageUrl) => {
    // Create an array with just this image URL for the gallery
    openImageGallery([imageUrl])
  }

  // Update the openImageGallery function to reset transformations
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
          try {
            // Tạo mảng URI từ các assets đã chọn
            const imageUris = result.assets.map((asset) => asset.uri)

            // Gọi API để gửi nhiều ảnh
            const response = await messageService.sendImageMessage(conversation.id, imageUris)

            // Cập nhật UI với tin nhắn mới
            setMessages([response, ...messages])

            Alert.alert("Thành công", "Đã gửi nhóm hình ảnh thành công!")
          } catch (apiError) {
            console.error("Error sending multiple images:", apiError)
            Alert.alert("Lỗi", "Không thể gửi nhóm hình ảnh. Vui lòng thử lại.")
          }
        } else {
          // Nếu chỉ chọn một ảnh
          const asset = result.assets[0]
          const imageUri = asset.uri
          console.log("Selected image URI:", imageUri)

          try {
            // Gọi API để gửi một ảnh
            const response = await messageService.sendImageMessage(conversation.id, [imageUri])

            // Cập nhật UI với tin nhắn mới
            setMessages([response, ...messages])

            Alert.alert("Thành công", "Đã gửi hình ảnh thành công!")
          } catch (apiError) {
            console.error("Error sending single image:", apiError)
            Alert.alert("Lỗi", "Không thể gửi hình ảnh. Vui lòng thử lại.")
          }
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

        try {
          // Gọi API để gửi file
          const response = await messageService.sendFileMessage(
            conversation.id,
            file.uri,
            file.name,
            file.mimeType,
            file.size,
          )

          // Cập nhật UI với tin nhắn mới
          setMessages([response, ...messages])

          Alert.alert("Thành công", `Đã gửi file "${file.name}" thành công!`)
        } catch (apiError) {
          console.error("Error sending file via API:", apiError)
          Alert.alert("Lỗi", "Không thể gửi file. Vui lòng thử lại.")
        }
      }
    } catch (err) {
      console.error("Error picking document:", err)
      Alert.alert("Lỗi", `Không thể chọn file. Lỗi: ${err.message}`)
    }
  }

  const handleCopyMessage = async (message) => {
    try {
      if (message.type === "text" || message.type === "emoji" || isSingleEmoji(message.content)) {
        await Clipboard.setStringAsync(message.content)
        Alert.alert("Đã sao chép", "Tin nhắn đã được sao chép vào bộ nhớ tạm.")
      } else if (
        message.type === "image" ||
        (message.attachments && message.attachments.length > 0 && message.attachments[0].type.startsWith("image/"))
      ) {
        // For image messages, we need to download and share the image
        const imageUrl = message.attachments ? message.attachments[0].url : message.imageUrl || message.content

        // Show loading indicator
        setLoading(true)

        // Create a temporary file path
        const fileUri = FileSystem.cacheDirectory + `temp_image_${Date.now()}.jpg`

        // Download the image
        const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri)

        if (downloadResult.status === 200) {
          // Check if sharing is available
          const isSharingAvailable = await Sharing.isAvailableAsync()

          if (isSharingAvailable) {
            // This will open the share dialog which includes copy option on iOS
            // On Android, it will open sharing options which includes copy to clipboard on most devices
            await Sharing.shareAsync(fileUri, {
              mimeType: "image/jpeg",
              dialogTitle: "Copy or Share Image",
            })
          } else {
            // Fallback for devices without sharing capability
            // Save to media library and notify user
            const { status } = await MediaLibrary.requestPermissionsAsync()

            if (status === "granted") {
              await MediaLibrary.saveToLibraryAsync(fileUri)
              Alert.alert("Đã lưu ảnh", "Ảnh đã được lưu vào thư viện của bạn. Bạn có thể sao chép nó từ đó.")
            } else {
              Alert.alert("Cần quyền truy cập", "Cần quyền truy cập để lưu ảnh")
            }
          }
        } else {
          Alert.alert("Lỗi", "Không thể tải xuống ảnh")
        }

        setLoading(false)
      } else if (message.type === "imageGroup" && message.attachments && message.attachments.length > 0) {
        // For image groups, copy the first image URL
        const imageUrl = message.attachments[0].url
        await Clipboard.setStringAsync(imageUrl)
        Alert.alert("Đã sao chép", "Đường dẫn hình ảnh đầu tiên đã được sao chép vào bộ nhớ tạm.")
      }

      // Close the action menu
      setShowMessageActions(false)
    } catch (error) {
      console.error("Copy error:", error)
      Alert.alert("Lỗi", "Không thể sao chép tin nhắn")
      setLoading(false)
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
    // In the renderMessage function, add a special case for system messages
    // Add this before the "If message is deleted or recalled" check

    // Handle system messages
    if (item.type === "system") {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageBubble}>
            <Text style={styles.systemMessageText}>{item.content}</Text>
            {item.showTime && <Text style={styles.systemMessageTime}>{item.formattedTime}</Text>}
          </View>
        </View>
      )
    }

    // If message is deleted or recalled, show special message
    if (item.isDeleted) {
      return (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
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
              styles.deletedMessageBubble,
            ]}
          >
            <Text style={styles.deletedMessageText}>Tin nhắn đã bị xóa</Text>
            {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
          </View>
        </View>
      )
    }

    if (item.isRecalled) {
      return (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
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
              styles.recalledMessageBubble,
            ]}
          >
            <Text style={styles.recalledMessageText}>Tin nhắn đã bị thu hồi</Text>
            {item.showTime && <Text style={styles.messageTime}>{item.formattedTime}</Text>}
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
            <MessageAvatar senderId={item.senderId} isGroup={conversation.isGroup} />
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
            <MessageAvatar senderId={item.senderId} isGroup={conversation.isGroup} />
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
            <MessageAvatar senderId={item.senderId} isGroup={conversation.isGroup} />
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
          <MessageAvatar senderId={item.senderId} isGroup={conversation.isGroup} />
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

  // Create a component to handle message avatars with API fetching
  const MessageAvatar = ({ senderId, isGroup }) => {
    const [sender, setSender] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      // Only fetch user details if this is a group conversation
      if (isGroup && senderId) {
        const getSender = async () => {
          try {
            setLoading(true)
            const user = await fetchUserDetails(senderId)
            setSender(user)
          } catch (error) {
            console.error(`Error fetching sender ${senderId}:`, error)
          } finally {
            setLoading(false)
          }
        }
        getSender()
      }
    }, [senderId, isGroup])

    if (!isGroup) {
      // For one-on-one conversations, just show the conversation avatar
      return (
        <Image
          source={conversation.avatar ? { uri: conversation.avatar } : require("../assets/icon.png")}
          style={styles.messageAvatar}
        />
      )
    }

    if (loading) {
      // Show a placeholder while loading
      return <View style={[styles.messageAvatar, { backgroundColor: "#333" }]} />
    }

    // For group conversations, show the sender's avatar
    return (
      <Image
        source={sender?.avatarUrl ? { uri: sender.avatarUrl } : require("../assets/icon.png")}
        style={styles.messageAvatar}
      />
    )
  }

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

  // In the ChatDetailScreen component, update the handleForwardMessage function to pass the message content
  const handleForwardMessage = (message) => {
    setShowMessageActions(false)
    setShowForwardScreen(true)
    setMessageToForward(message)
  }

  // Update the handleSelectForwardContact function in the ChatDetailScreen component
  const handleSelectForwardContact = async (contact) => {
    try {
      setShowForwardScreen(false)

      if (messageToForward) {
        // Get or create a conversation with this contact
        const conversation = await messageService.getOrStartConversation(contact.id)

        // Forward the message to this conversation
        await messageService.forwardMessage(messageToForward.messageId, conversation.conversationId)

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
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
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

  // Update the header section in the return statement
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
          {renderHeaderAvatar()}

          <View style={styles.headerInfo}>
            <Text style={styles.contactName}>{conversation.name}</Text>
            {conversation.isGroup && (
              <Text style={styles.groupMembersCount}>
                {conversation.members ? `${conversation.members.length} thành viên` : ""}
              </Text>
            )}
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
        onDelete={() => {
          handleDeleteMessage(selectedMessage)
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
        messageToForward={messageToForward}
      />
    </SafeAreaView>
  )
}

// Update the styles to make the forwarded message input look better
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
    zIndex: 10,
  },
  galleryCloseButton: {
    padding: 10,
  },
  galleryCounter: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  galleryImageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  galleryImage: {
    width: width,
    height: height,
  },
  galleryControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  galleryControlButton: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 25,
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
    textAlign: "right",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  forwardContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  forwardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  forwardHeaderTitle: {
    flex: 1,
    marginLeft: 16,
  },
  forwardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  forwardSubtitle: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  forwardSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  forwardSearchIcon: {
    marginRight: 8,
  },
  forwardSearchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
  },
  forwardScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  forwardSectionContainer: {
    marginBottom: 20,
  },
  forwardSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  forwardContactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  forwardContactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  forwardContactInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forwardContactName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  forwardCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8E8E93",
    backgroundColor: "transparent",
  },
  forwardCheckboxSelected: {
    backgroundColor: "#0068FF",
    borderColor: "#0068FF",
  },
  forwardFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  forwardInputContainer: {
    flex: 1,
    backgroundColor: "#262626",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  forwardMessageInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 60,
    textAlignVertical: "center",
  },
  forwardSendButton: {
    backgroundColor: "#0068FF",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  forwardSendButtonDisabled: {
    backgroundColor: "rgba(0, 104, 255, 0.5)",
  },
  alphabetHeader: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  groupAvatarContainer: {
    marginRight: 12,
  },
  groupAvatarsStack: {
    width: 40,
    height: 40,
    position: "relative",
  },
  groupStackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#121212",
  },
  groupMemberCount: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupMemberCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 10,
    color: "#0068FF",
  },
  seeMoreText: {
    color: "#0068FF",
    fontSize: 14,
    marginRight: 4,
  },
  forwardLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  forwardErrorContainer: {
    padding: 20,
    alignItems: "center",
  },
  forwardErrorText: {
    color: "#FF3B30",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  forwardRetryButton: {
    backgroundColor: "#0068FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  forwardRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  deletedMessageBubble: {
    backgroundColor: "#333333",
    alignSelf: "flex-start", // This ensures the bubble only takes up as much width as needed
    maxWidth: "80%", // Limit the width to maintain readability
  },
  deletedMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
    fontSize: 14,
  },
  recalledMessageBubble: {
    backgroundColor: "#333333",
    alignSelf: "flex-start", // This ensures the bubble only takes up as much width as needed
    maxWidth: "80%", // Limit the width to maintain readability
  },
  recalledMessageText: {
    color: "#A9A9A9",
    fontStyle: "italic",
    fontSize: 14,
  },
  headerGroupAvatarGrid: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#262626",
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  headerGroupMemberAvatar: {
    width: 20,
    height: 20,
  },
  headerTopLeftAvatar: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  headerTopRightAvatar: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  headerBottomLeftAvatar: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  headerBottomRightAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  groupMembersCount: {
    color: "#A9A9A9",
    fontSize: 13,
  },
  headerGroupAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessageBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: "80%",
  },
  systemMessageText: {
    color: "#A9A9A9",
    fontSize: 14,
    textAlign: "center",
  },
  systemMessageTime: {
    fontSize: 10,
    color: "rgba(169, 169, 169, 0.7)",
    marginTop: 4,
    textAlign: "center",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fileExtension: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  fileSize: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
  },
})

export default ChatDetailScreen
