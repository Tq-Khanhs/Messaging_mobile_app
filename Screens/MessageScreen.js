"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons"
import { messageService } from "../services/messageService"
import { authService } from "../services/authService"
import AsyncStorage from "@react-native-async-storage/async-storage"

const MessagesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("priority")
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  // Add this new state for the dropdown menu
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)

  // Add this function to toggle the dropdown menu
  const toggleDropdownMenu = () => {
    setShowDropdownMenu(!showDropdownMenu)
  }

  useEffect(() => {
    const loadUserAndConversations = async () => {
      try {
        setLoading(true)

        // Check if user is authenticated
        const token = await AsyncStorage.getItem("authToken")
        if (!token) {
          console.log("No auth token found, redirecting to login")
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
          return
        }

        console.log("Auth token found, length:", token.length)

        const user = await authService.getCurrentUser()
        setCurrentUser(user)

        if (user) {
          console.log("User loaded successfully:", user.userId)
          await fetchConversations()
        } else {
          console.log("User data not found, redirecting to login")
          await AsyncStorage.removeItem("authToken")
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        }
      } catch (err) {
        console.error("Error loading user and conversations:", err)

        // Check if error is due to authentication
        if (err.response && err.response.status === 401) {
          console.log("Authentication error, redirecting to login")
          await AsyncStorage.removeItem("authToken")
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        } else {
          setError("Failed to load conversations")
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserAndConversations()

    // Set up a refresh interval to check for new messages
    const intervalId = setInterval(fetchConversations, 10000) // every 10 seconds

    return () => clearInterval(intervalId)
  }, [])

  // Add a new useEffect to listen for navigation focus events and check for refresh parameter
  useEffect(() => {
    // Add a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      // Check if we need to refresh conversations (coming from group creation)
      const params = navigation.getState().routes.find((r) => r.name === "MessageScreen")?.params
      if (params?.refreshConversations) {
        console.log("Refreshing conversations after group creation")
        fetchConversations()

        // If we have a new group ID, we could potentially scroll to it or highlight it
        if (params.newGroupId) {
          console.log("New group created with ID:", params.newGroupId)
          // Reset the parameter to avoid refreshing again on next focus
          navigation.setParams({ refreshConversations: undefined, newGroupId: undefined })
        }
      }
    })

    // Clean up the listener when component unmounts
    return unsubscribe
  }, [navigation])

  // Update the fetchConversations function to fetch group details for group conversations
  const fetchConversations = async () => {
    try {
      // Check if token exists before making the request
      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        console.log("No auth token found when fetching conversations")
        setError("Authentication required")
        return
      }

      console.log("Fetching conversations...")
      const data = await messageService.getConversations()
      console.log(`Received ${data.length} conversations`)

      // Process conversations to ensure they have all required fields
      const processedConversations = await Promise.all(
        data.map(async (conversation) => {
          // For group conversations, fetch group details
          if (conversation.isGroup) {
            try {
              // Fetch group details using conversationId
              const groupDetails = await messageService.getGroupByConversationId(conversation.conversationId)

              return {
                ...conversation,
                groupName: groupDetails?.name || "Nhóm chat",
                groupDescription: groupDetails?.description || "",
                groupAvatarUrl: groupDetails?.avatarUrl,
                members: groupDetails?.members || [],
              }
            } catch (err) {
              console.error("Error fetching group details:", err)
              return {
                ...conversation,
                groupName: conversation.groupName || "Nhóm chat",
                members: conversation.members || [],
              }
            }
          }
          return conversation
        }),
      )

      setConversations(processedConversations)
      setError(null)
    } catch (err) {
      console.error("Error fetching conversations:", err)

      // Check if error is due to authentication
      if (err.response && err.response.status === 401) {
        setError("Session expired. Please login again.")

        // Optional: Auto redirect to login after a delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        }, 2000)
      } else {
        setError("Failed to load conversations")
      }
    }
  }

  // Update the handleConversationPress function to pass group information
  const handleConversationPress = async (conversation) => {
    // Mark conversation as read when opening it
    if (conversation.unreadCount > 0) {
      try {
        // Mark all unread messages as read
        if (conversation.lastMessage) {
          await messageService.markMessageAsRead(conversation.lastMessage.messageId)
        }

        // Update the local state to reflect the read status
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === conversation.conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
        )
      } catch (err) {
        console.error("Error marking conversation as read:", err)
      }
    }

    console.log("Navigating to conversation:", {
      conversationId: conversation.conversationId,
      name: conversation.isGroup
        ? conversation.groupName || "Nhóm chat"
        : conversation.participant?.fullName || "Unknown",
      isGroup: conversation.isGroup,
    })

    // Navigate to chat detail screen with the correct conversation ID and group info
    navigation.navigate("ChatDetail", {
      conversation: {
        id: conversation.conversationId,
        name: conversation.isGroup
          ? conversation.groupName || "Nhóm chat"
          : conversation.participant?.fullName || "Unknown",
        avatar: conversation.isGroup ? conversation.groupAvatarUrl : conversation.participant?.avatarUrl,
        online: false,
        isGroup: conversation.isGroup || false,
        members: conversation.members || [],
        description: conversation.isGroup ? conversation.groupDescription : "",
      },
    })
  }

  const formatLastMessagePreview = (message) => {
    if (!message) return ""

    switch (message.type) {
      case "image":
        return "[Hình ảnh]"
      case "file":
        return "[File]"
      case "emoji":
        return message.content // Show the emoji directly
      case "text":
      default:
        // If sender is current user, prepend "Bạn: "
        const prefix = message.senderId === currentUser?.userId ? "Bạn: " : ""

        // If message is recalled or deleted
        if (message.isRecalled) return "Tin nhắn đã bị thu hồi"
        if (message.isDeleted) return "Tin nhắn đã bị xóa"

        // Truncate long messages
        let content = message.content
        if (content && content.length > 30) {
          content = content.substring(0, 27) + "..."
        }

        return prefix + content
    }
  }

  // Update the renderConversationItem function to properly display group information
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item)}>
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          item.groupAvatarUrl ? (
            // Group with custom avatar
            <Image source={{ uri: item.groupAvatarUrl }} style={styles.avatar} />
          ) : (
            // Group without custom avatar - show member avatars in a grid
            <View style={styles.groupAvatarGrid}>
              {item.members && item.members.length > 0 ? (
                item.members
                  .slice(0, 4)
                  .map((member, index) => (
                    <Image
                      key={member.userId || index}
                      source={member.avatarUrl ? { uri: member.avatarUrl } : require("../assets/icon.png")}
                      style={[
                        styles.groupMemberAvatar,
                        index === 0 && styles.topLeftAvatar,
                        index === 1 && styles.topRightAvatar,
                        index === 2 && styles.bottomLeftAvatar,
                        index === 3 && styles.bottomRightAvatar,
                      ]}
                    />
                  ))
              ) : (
                // Fallback if no members are available
                <View style={styles.groupAvatarPlaceholder}>
                  <Ionicons name="people" size={24} color="#FFFFFF" />
                </View>
              )}
            </View>
          )
        ) : (
          // Regular one-on-one conversation avatar
          <Image
            source={item.participant?.avatarUrl ? { uri: item.participant.avatarUrl } : require("../assets/icon.png")}
            style={styles.avatar}
          />
        )}

        {item.isGroup && item.members && item.members.length > 0 && (
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCountText}>{item.members.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.isGroup ? item.groupName || "Nhóm chat" : item.participant?.fullName || "Unknown"}
            </Text>
            {item.isOfficial && (
              <View style={styles.officialBadge}>
                <MaterialIcons name="verified" size={14} color="#FFD700" />
              </View>
            )}
          </View>
          <Text style={styles.timeText}>
            {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {formatLastMessagePreview(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && <View style={styles.notificationDot} />}
        </View>
      </View>
    </TouchableOpacity>
  )

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchConversations}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate("SearchScreen")}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#888" editable={false} />

          {/* <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="qr-code" size={22} color="#FFF" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.headerButton} onPress={toggleDropdownMenu}>
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {showDropdownMenu && (
        <View style={styles.dropdownMenuContainer}>
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownMenuItem}
              onPress={() => {
                setShowDropdownMenu(false)
                navigation.navigate("SearchScreen")
              }}
            >
              <View style={styles.dropdownMenuIconContainer}>
                <Ionicons name="person-add-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.dropdownMenuText}>Thêm bạn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownMenuItem}
              onPress={() => {
                setShowDropdownMenu(false)
                navigation.navigate("CreateGroupScreen")
              }}
            >
              <View style={styles.dropdownMenuIconContainer}>
                <Ionicons name="people-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.dropdownMenuText}>Tạo nhóm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdownMenuItem}>
              <View style={styles.dropdownMenuIconContainer}>
                <Ionicons name="cloud-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.dropdownMenuText}>Cloud của tôi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "priority" && styles.activeTab]}
          onPress={() => setActiveTab("priority")}
        >
          <Text style={[styles.tabText, activeTab === "priority" && styles.activeTabText]}>Ưu tiên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "other" && styles.activeTab]}
          onPress={() => setActiveTab("other")}
        >
          <Text style={[styles.tabText, activeTab === "other" && styles.activeTabText]}>Khác</Text>
        </TouchableOpacity>
        <View style={styles.tabSpacer} />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.conversationId.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchConversations}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="chatbubble-outline" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Tin Nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ContactsScreen")}>
          <Ionicons name="people" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#888" onPress={() => navigation.navigate("ProfileScreen")} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// Add these new styles for group avatars
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
    color: "#FF3B30",
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0068FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    width: "100%",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    width: 400,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    marginLeft: 8,
    fontSize: 16,
  },
  headerButton: {
    marginLeft: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFF",
  },
  tabText: {
    color: "#888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "500",
  },
  tabSpacer: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  conversationItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
    width: 50,
    height: 50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatarGrid: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  groupMemberAvatar: {
    width: 25,
    height: 25,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  topLeftAvatar: {
    top: 0,
    left: 0,
  },
  topRightAvatar: {
    top: 0,
    right: 0,
  },
  bottomLeftAvatar: {
    bottom: 0,
    left: 0,
  },
  bottomRightAvatar: {
    bottom: 0,
    right: 0,
  },
  groupAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
  },
  memberCountBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#333",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    paddingHorizontal: 4,
  },
  memberCountText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  conversationName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 4,
  },
  officialBadge: {
    marginLeft: 4,
  },
  timeText: {
    color: "#888",
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessageText: {
    color: "#888",
    fontSize: 14,
    flex: 1,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
    backgroundColor: "#1A1A1A",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: "#0068FF",
  },
  activeNavText: {
    color: "#0068FF",
    fontSize: 12,
    marginTop: 2,
  },
  dropdownMenuContainer: {
    position: "absolute",
    top: 56, // Adjust based on your header height
    right: 10,
    zIndex: 1000,
    width: 250,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    backgroundColor: "#262626",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 8,
  },
  dropdownMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownMenuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dropdownMenuText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
})

export default MessagesScreen
