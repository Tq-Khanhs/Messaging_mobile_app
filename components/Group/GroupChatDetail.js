"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import VoiceRecorder from "../Voice/VoiceRecorder"
import StickerPicker from "../Sticker/StickerPicker"
import MoreActions from "../MoreAction/MoreActions"
import GroupInfoModal from "./GroupInfoModal"
import MessageItem from "../Message/MessageItem"
import MessageOptionsModal from "../Message/MessageOptionsModal"
import ReplyBar from "../Message/ReplyBar"
import SearchMessages from "../Message/SearchMessages"
import { formatMessageTime } from "../../utils/timeUtils"

const GroupChatDetail = ({ route, navigation }) => {
  const { group } = route.params || {
    id: "group1",
    name: "Nhóm 12 _ CNM",
    avatar: null,
    memberCount: 5,
  }

  // Refs
  const flatListRef = useRef(null)
  const inputRef = useRef(null)

  // Current date for comparison
  const currentDate = new Date()

  // Messages state
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  // UI state
  const [inputText, setInputText] = useState("")
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Message options modal state
  const [showMessageOptions, setShowMessageOptions] = useState(false)
  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState(null)
  const [messageOptionsPosition, setMessageOptionsPosition] = useState({ x: 0, y: 0 })

  // Reply state
  const [replyingToMessage, setReplyingToMessage] = useState(null)

  // Search state
  const [highlightedMessageId, setHighlightedMessageId] = useState(null)

  // Fetch messages from the backend
  useEffect(() => {
    fetchMessages()
  }, [])

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
      setShowAttachmentOptions(false)
      setShowStickerPicker(false)
    })
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false))

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Mock data for group chat messages
      const mockMessages = [
        {
          id: "1",
          text: "Mai mấy h vậy",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 40),
          isMe: false,
          type: "text",
          sender: {
            id: "user1",
            name: "Tấn Tài",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            color: "#4A7AFF", // Blue color for this user's name
          },
        },
        {
          id: "2",
          text: "9h há",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 40),
          isMe: false,
          type: "text",
          sender: {
            id: "user1",
            name: "Tấn Tài",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            color: "#4A7AFF", // Blue color for this user's name
          },
        },
        {
          id: "3",
          text: "mấy ông chọn h đi",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 40),
          isMe: false,
          type: "text",
          sender: {
            id: "user2",
            name: "Nguyễn Thành Nhân",
            avatar: "https://randomuser.me/api/portraits/men/42.jpg",
            color: "#00BFA5", // Green color for this user's name
          },
        },
        {
          id: "4",
          text: "9h đi",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 40),
          isMe: false,
          type: "text",
          sender: {
            id: "user1",
            name: "Tấn Tài",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            color: "#4A7AFF", // Blue color for this user's name
          },
        },
        {
          id: "5",
          text: "k biết mấy ông kia rảnh khi nào nữa",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 40),
          isMe: false,
          type: "text",
          sender: {
            id: "user2",
            name: "Nguyễn Thành Nhân",
            avatar: "https://randomuser.me/api/portraits/men/42.jpg",
            color: "#00BFA5", // Green color for this user's name
          },
        },
        {
          id: "6",
          text: "9h đi",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 41),
          isMe: false,
          type: "text",
          sender: {
            id: "user1",
            name: "Tấn Tài",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            color: "#4A7AFF", // Blue color for this user's name
          },
          replyTo: {
            id: "2",
            text: "9h đi",
            type: "text",
            isMe: false,
            sender: {
              id: "user1",
              name: "Tấn Tài",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
          },
          mentions: [
            {
              id: "user1",
              name: "Tấn Tài",
              startIndex: 0,
              endIndex: 7,
            },
          ],
          text: "@Tấn Tài đc thì 9h nha",
          reaction: "love",
          reactionCount: 1,
        },
        {
          id: "7",
          text: "ê chiều đc k mn @@",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 41),
          isMe: true,
          type: "text",
          sender: {
            id: "currentUser",
            name: "Tôi",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          },
        },
        {
          id: "8",
          text: "chiều hay tối đc k",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 41),
          isMe: true,
          type: "text",
          sender: {
            id: "currentUser",
            name: "Tôi",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          },
        },
        {
          id: "9",
          text: "k kịp á",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 42),
          isMe: false,
          type: "text",
          sender: {
            id: "user2",
            name: "Nguyễn Thành Nhân",
            avatar: "https://randomuser.me/api/portraits/men/42.jpg",
            color: "#00BFA5", // Green color for this user's name
          },
        },
        {
          id: "10",
          text: "vs chiều tui học nữa",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 22, 42),
          isMe: false,
          type: "text",
          sender: {
            id: "user2",
            name: "Nguyễn Thành Nhân",
            avatar: "https://randomuser.me/api/portraits/men/42.jpg",
            color: "#00BFA5", // Green color for this user's name
          },
        },
      ]

      setMessages(mockMessages)
      setHasMoreMessages(false)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (inputText.trim() === "") return

    // Get the current time
    const currentTime = new Date()

    // Create new message object
    const newMessage = {
      id: `temp-${Date.now()}`, // Temporary ID until we get the real one from the server
      text: inputText,
      timestamp: currentTime,
      isMe: true,
      type: "text",
      sender: {
        id: "currentUser",
        name: "Tôi",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      // Add reply information if replying to a message
      replyTo: replyingToMessage,
    }

    // Optimistically update UI
    setMessages([newMessage, ...messages])
    setInputText("")
    setReplyingToMessage(null)
    Keyboard.dismiss()
  }

  const handleMessagePress = (messageId) => {
    // Toggle selected message for time display
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null)
    } else {
      setSelectedMessageId(messageId)
    }
  }

  const handleMessageLongPress = (message, position) => {
    setSelectedMessageForOptions(message)
    setMessageOptionsPosition(position)
    setShowMessageOptions(true)
  }

  const handleDeleteMessage = async (messageId) => {
    // Optimistically update UI
    setMessages(messages.filter((message) => message.id !== messageId))

    // Show toast notification
    if (Platform.OS === "android") {
      ToastAndroid.show("Đã xóa tin nhắn", ToastAndroid.SHORT)
    } else {
      Alert.alert("Thông báo", "Đã xóa tin nhắn")
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

  const handleCopyMessage = (text) => {
    Clipboard.setString(text)

    // Show toast notification
    if (Platform.OS === "android") {
      ToastAndroid.show("Đã sao chép tin nhắn", ToastAndroid.SHORT)
    } else {
      Alert.alert("Thông báo", "Đã sao chép tin nhắn")
    }
  }

  const handleReactToMessage = async (messageId, reactionType) => {
    // Update the message with the reaction
    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        // If the message already has this reaction, remove it
        // Otherwise, set the new reaction (replacing any existing one)
        const newReaction = message.reaction === reactionType ? null : reactionType
        const newReactionCount = newReaction ? (message.reactionCount || 0) + 1 : (message.reactionCount || 1) - 1
        return {
          ...message,
          reaction: newReaction,
          reactionCount: newReactionCount > 0 ? newReactionCount : null,
        }
      }
      return message
    })

    setMessages(updatedMessages)
  }

  const handleSwipeToReply = (message) => {
    handleReplyToMessage(message)
  }

  const handleCancelReply = () => {
    setReplyingToMessage(null)
  }

  const handleScrollToMessage = (message) => {
    if (message && flatListRef.current) {
      // Find the index of the message we want to scroll to
      const messageIndex = messages.findIndex((m) => m.id === message.id)

      if (messageIndex >= 0) {
        // Scroll to the message
        flatListRef.current.scrollToIndex({
          index: messageIndex,
          animated: true,
          viewPosition: 0.5,
        })

        // Highlight the message temporarily
        setHighlightedMessageId(message.id)

        // Clear the highlight after a delay
        setTimeout(() => {
          setHighlightedMessageId(null)
        }, 2000)
      }
    }
  }

  // This function will be called when the search button is clicked in InfoModal
  const handleSearchMessages = () => {
    setShowSearch(true)
  }

  const handleCloseSearch = () => {
    setShowSearch(false)
    setHighlightedMessageId(null)
  }

  // Process messages to determine which ones should show avatar and time
  const processedMessages = messages.map((message, index) => {
    // Check if this message is from the same sender as the next one
    // Since the list is inverted, we check the next index (which is actually the previous message in time)
    const nextMessage = messages[index + 1]
    const isFirstInSequence = !nextMessage || nextMessage.sender.id !== message.sender.id

    // Check if this message is the last in a sequence from the same sender
    const prevMessage = messages[index - 1]
    const isLastInSequence = !prevMessage || prevMessage.sender.id !== message.sender.id

    // Determine if we should show the time
    let showTime = false

    // Always show time for the first message in the chat
    if (index === messages.length - 1) {
      showTime = true
    }
    // Show time if selected by user
    else if (message.id === selectedMessageId) {
      showTime = true
    }
    // Show time if more than 15 minutes have passed since the previous message
    else if (nextMessage) {
      // Calculate time difference in minutes
      const diffInMinutes = Math.floor((message.timestamp - nextMessage.timestamp) / (1000 * 60))

      // Show time if more than 15 minutes have passed
      if (diffInMinutes > 15) {
        showTime = true
      }
    }

    // Format the time string based on how old the message is
    const formattedTime = formatMessageTime(message.timestamp)

    // Check if this message is highlighted (for search results)
    const isHighlighted = message.id === highlightedMessageId

    return {
      ...message,
      isFirstInSequence,
      isLastInSequence,
      showTime,
      formattedTime,
      isHighlighted,
    }
  })

  // Custom message renderer that handles highlighting with blue border
  const renderMessage = ({ item }) => {
    return (
      <View style={item.isHighlighted ? styles.highlightedMessageContainer : null}>
        <MessageItem
          message={item}
          onPress={handleMessagePress}
          onLongPress={handleMessageLongPress}
          onSwipeToReply={handleSwipeToReply}
          isGroupChat={true}
        />
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084FF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo} onPress={() => setShowInfoModal(true)}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>{group.memberCount} thành viên</Text>
        </TouchableOpacity>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("GroupVideoCall", { group })}>
            <Icon name="videocam" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSearchMessages}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowInfoModal(true)}>
            <Icon name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={processedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        inverted
        style={styles.chatBackground}
        onEndReached={() => {
          if (hasMoreMessages && !loadingMore) {
            // Load more messages
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#0084FF" />
              <Text style={styles.loadingMoreText}>Loading more messages...</Text>
            </View>
          ) : null
        }
        onScrollToIndexFailed={(info) => {
          console.warn("Failed to scroll to index", info)
        }}
      />

      {/* Reply bar */}
      {replyingToMessage && (
        <ReplyBar
          message={replyingToMessage}
          onCancel={handleCancelReply}
          onScrollToMessage={() => handleScrollToMessage(replyingToMessage)}
        />
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => {
            setShowAttachmentOptions(!showAttachmentOptions)
            if (showAttachmentOptions) {
              setShowStickerPicker(false)
            }
            if (isKeyboardVisible) {
              Keyboard.dismiss()
            }
          }}
        >
          <Icon name="add" size={28} color="#0084FF" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#AAAAAA"
          multiline
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />

        {inputText.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={24} color="#0084FF" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => {
                setShowVoiceRecorder(!showVoiceRecorder)
                if (!showVoiceRecorder) {
                  setShowStickerPicker(false)
                  setShowAttachmentOptions(false)
                  if (isKeyboardVisible) {
                    Keyboard.dismiss()
                  }
                }
              }}
            >
              <Icon name="keyboard-voice" size={28} color="#0084FF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stickerButton}
              onPress={() => {
                setShowStickerPicker(!showStickerPicker)
                if (!showStickerPicker) {
                  setShowVoiceRecorder(false)
                  setShowAttachmentOptions(false)
                  if (isKeyboardVisible) {
                    Keyboard.dismiss()
                  }
                }
              }}
            >
              <Icon name="insert-emoticon" size={26} color="#FFD700" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Attachment options */}
      {showAttachmentOptions && (
        <MoreActions
          onSendImage={(image) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              imageUri: image.uri,
              timestamp: currentTime,
              isMe: true,
              type: "image",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowAttachmentOptions(false)
            setReplyingToMessage(null)
          }}
          onSendVideo={(video) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              videoUri: video.uri,
              timestamp: currentTime,
              isMe: true,
              type: "video",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowAttachmentOptions(false)
            setReplyingToMessage(null)
          }}
          onSendDocument={(document) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              documentUri: document.uri,
              documentName: document.name,
              timestamp: currentTime,
              isMe: true,
              type: "document",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowAttachmentOptions(false)
            setReplyingToMessage(null)
          }}
          onSendLocation={(location) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              timestamp: currentTime,
              isMe: true,
              type: "location",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowAttachmentOptions(false)
            setReplyingToMessage(null)
          }}
        />
      )}

      {/* Voice recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={(duration) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              voiceDuration: duration,
              timestamp: currentTime,
              isMe: true,
              type: "voice",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowVoiceRecorder(false)
            setReplyingToMessage(null)
          }}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* Sticker picker */}
      {showStickerPicker && (
        <StickerPicker
          onStickerSelect={(sticker) => {
            const currentTime = new Date()
            const newMessage = {
              id: `temp-${Date.now()}`,
              stickerId: sticker.id,
              stickerUrl: sticker.url,
              timestamp: currentTime,
              isMe: true,
              type: "sticker",
              sender: {
                id: "currentUser",
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
              },
              replyTo: replyingToMessage,
            }

            // Optimistically update UI
            setMessages([newMessage, ...messages])
            setShowStickerPicker(false)
            setReplyingToMessage(null)
          }}
        />
      )}

      {/* Message Options Modal */}
      <MessageOptionsModal
        visible={showMessageOptions}
        onClose={() => setShowMessageOptions(false)}
        message={selectedMessageForOptions}
        position={messageOptionsPosition}
        onDelete={handleDeleteMessage}
        onReply={handleReplyToMessage}
        onCopy={handleCopyMessage}
        onReact={handleReactToMessage}
      />

      {/* Group Info Modal */}
      {showInfoModal && (
        <GroupInfoModal
          group={group}
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          navigation={navigation}
          onSearchMessages={handleSearchMessages}
        />
      )}

      {/* Search Messages Component */}
      {showSearch && (
        <SearchMessages
          groupId={group?.id || "group1"}
          onClose={handleCloseSearch}
          onScrollToMessage={handleScrollToMessage}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  memberCount: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  chatBackground: {
    backgroundColor: "#121212",
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1E1E1E",
    borderTopWidth: 0.5,
    borderTopColor: "#333333",
  },
  attachmentButton: {
    padding: 8,
    marginRight: 5,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 5,
  },
  stickerButton: {
    padding: 8,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#2D2D2D",
    borderRadius: 18,
    marginHorizontal: 5,
    color: "#FFFFFF",
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: "center",
  },
  loadingMoreText: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0084FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  highlightedMessageContainer: {
    borderWidth: 2,
    borderColor: "#0084FF",
    borderRadius: 12,
    marginVertical: 2,
  },
})

export default GroupChatDetail
