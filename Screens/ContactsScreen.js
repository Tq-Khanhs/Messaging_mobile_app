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
  SectionList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { friendService } from "../services/friendService"
import { messageService } from "../services/messageService"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Add imports at the top
import { useSocket } from "../context/SocketContext"

const ContactsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("friends")
  const [activeFilter, setActiveFilter] = useState("all")
  const [friendRequestCount, setFriendRequestCount] = useState(0)

  // Thêm state cho danh sách bạn bè
  const [friendsData, setFriendsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Add state for groups
  const [groupsData, setGroupsData] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [groupsError, setGroupsError] = useState(null)

  // Inside the ContactsScreen component, add these hooks
  const { isConnected, onlineUsers, addListener, removeListener } = useSocket()

  // Thm useEffect để lấy danh sách bạn bè và số lượng lời mời kết bạn
  useEffect(() => {
    fetchFriendData()
    fetchGroupsData()
  }, [])

  // Add this useEffect to handle socket events
  useEffect(() => {
    // Listen for friend request events
    const friendRequestHandler = (data) => {
      console.log("Friend request received:", data)
      // Update friend request count
      setFriendRequestCount((prev) => prev + 1)
    }

    // Listen for friend request response events
    const friendRequestResponseHandler = (data) => {
      console.log("Friend request response:", data)
      // Refresh friends list if request was accepted
      if (data.status === "accepted") {
        fetchFriendData()
      }
    }

    // Listen for group events
    const groupEventHandler = () => {
      console.log("Group event received, refreshing groups")
      fetchGroupsData()
    }

    // Register event listeners
    const unsubscribeFriendRequest = addListener("friend_request", friendRequestHandler)
    const unsubscribeFriendResponse = addListener("friend_request_response", friendRequestResponseHandler)

    // Add listeners for group events
    const unsubscribeGroupCreated = addListener("group_created", groupEventHandler)
    const unsubscribeGroupUpdated = addListener("group_updated", groupEventHandler)
    const unsubscribeGroupDissolved = addListener("group_dissolved", groupEventHandler)
    const unsubscribeGroupAdded = addListener("group_added", groupEventHandler)
    const unsubscribeGroupRemoved = addListener("group_removed", groupEventHandler)
    const unsubscribeMemberAdded = addListener("member_added", groupEventHandler)
    const unsubscribeMemberRemoved = addListener("member_removed", groupEventHandler)

    // Clean up listeners on unmount
    return () => {
      unsubscribeFriendRequest()
      unsubscribeFriendResponse()
      unsubscribeGroupCreated()
      unsubscribeGroupUpdated()
      unsubscribeGroupDissolved()
      unsubscribeGroupAdded()
      unsubscribeGroupRemoved()
      unsubscribeMemberAdded()
      unsubscribeMemberRemoved()
    }
  }, [addListener])

  // Hàm để lấy dữ liệu bạn bè và lời mời kết bạn
  const fetchFriendData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Lấy danh sách bạn bè
      const friendsList = await friendService.getFriends()

      // Xử lý dữ liệu để phân loại theo chữ cái đầu tiên
      const processedData = processFriendsData(friendsList)
      setFriendsData(processedData)

      // Lấy số lượng lời mời kết bạn
      const receivedRequests = await friendService.getReceivedFriendRequests()
      if (receivedRequests && Array.isArray(receivedRequests)) {
        setFriendRequestCount(receivedRequests.length)
      }
    } catch (error) {
      console.error("Error fetching friend data:", error)
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Update the fetchGroupsData function to log the message types
  const fetchGroupsData = async () => {
    try {
      setGroupsLoading(true)
      setGroupsError(null)

      const token = await AsyncStorage.getItem("authToken")
      if (!token) {
        console.log("No auth token found when fetching groups")
        setGroupsError("Authentication required")
        return
      }

      console.log("Fetching conversations for groups...")
      const conversations = await messageService.getConversations()

      if (!conversations || !Array.isArray(conversations)) {
        console.warn("Invalid conversations data received:", conversations)
        setGroupsData([])
        return
      }

      // Filter only group conversations
      const groupConversations = conversations.filter((conv) => conv && conv.isGroup)
      console.log(`Found ${groupConversations.length} group conversations`)

      // Log the last message types for debugging
      groupConversations.forEach((conv) => {
        if (conv.lastMessage) {
          console.log(`Group ${conv.groupName || "Unknown"} last message:`, {
            content: conv.lastMessage.content,
            type: conv.lastMessage.type,
            messageType: conv.lastMessage.messageType, // Check if it's using a different property name
            isRecalled: conv.lastMessage.isRecalled,
            isDeleted: conv.lastMessage.isDeleted,
          })
        }
      })

      // Process each group to get details
      const processedGroups = await Promise.all(
        groupConversations.map(async (conversation) => {
          if (!conversation) return null

          try {
            const groupDetails = await messageService.getGroupByConversationId(
              conversation.conversationId || conversation._id,
            )

            const messageType = conversation.lastMessage?.type || conversation.lastMessage?.messageType || "text"

            return {
              id: conversation.conversationId || conversation._id,
              name: groupDetails?.name || conversation.groupName || "Nhóm chat",
              lastMessage: conversation.lastMessage?.content || "",
              time: formatTimeAgo(conversation.lastMessageAt),
              memberCount: groupDetails?.members?.length || conversation.members?.length || 0,
              avatarUrl: groupDetails?.avatarUrl,
              members: groupDetails?.members || conversation.members || [],
              description: groupDetails?.description || "",
              lastMessageType: messageType,
              lastMessageSenderId: conversation.lastMessage?.senderId,
              isRecalled: conversation.lastMessage?.isRecalled,
              isDeleted: conversation.isDeleted,
            }
          } catch (err) {
            console.error("Error fetching group details:", err)
            return {
              id: conversation.conversationId || conversation._id,
              name: conversation.groupName || "Nhóm chat",
              lastMessage: conversation.lastMessage?.content || "",
              time: formatTimeAgo(conversation.lastMessageAt),
              memberCount: conversation.members?.length || 0,
              members: conversation.members || [],
              lastMessageType: conversation.lastMessage?.type || conversation.lastMessage?.messageType || "text",
            }
          }
        }),
      )

      const validGroups = processedGroups.filter(Boolean)
      validGroups.forEach((group) => {
        console.log(`Processed group ${group.name}:`, {
          lastMessage: group.lastMessage,
          lastMessageType: group.lastMessageType,
          preview: formatLastMessagePreview(group),
        })
      })

      setGroupsData(validGroups)
      setGroupsError(null)
    } catch (err) {
      console.error("Error fetching groups:", err)
      setGroupsError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.")
    } finally {
      setGroupsLoading(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return ""

    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffMs = now - messageTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút`
    if (diffHours < 24) return `${diffHours} giờ`
    return `${diffDays} ngày`
  }


  const formatLastMessagePreview = (group) => {
    console.log(`Formatting message preview for ${group.name}:`, {
      lastMessage: group.lastMessage,
      lastMessageType: group.lastMessageType,
      isRecalled: group.isRecalled,
      isDeleted: group.isDeleted,
    })

    
    const messageType = (group.lastMessageType || "").toLowerCase()

    if (messageType === "image") {
      return "[Hình ảnh]"
    }

    if (messageType === "file") {
      return "[File]"
    }

    if (messageType === "emoji") {
      return group.lastMessage
    }

    const prefix = group.lastMessageSenderId === global.currentUser?.userId ? "Bạn: " : ""

    if (group.isRecalled) return "Tin nhắn đã bị thu hồi"
    if (group.isDeleted) return "Tin nhắn đã bị xóa"

    let content = group.lastMessage
    if (content && content.length > 30) {
      content = content.substring(0, 27) + "..."
    }

    return prefix + content
  }

  // Hàm xử lý dữ liệu bạn bè thành dạng section
  const processFriendsData = (friends) => {
    if (!friends || !Array.isArray(friends)) return []

    // Tạo map để lưu trữ bạn bè theo chữ cái đầu tiên
    const sections = {}

    // Phân loại bạn bè theo chữ cái đầu tiên
    friends.forEach((friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase()
      if (!sections[firstLetter]) {
        sections[firstLetter] = []
      }

      // Thêm bạn bè vào section tương ứng
      sections[firstLetter].push({
        id: friend.userId,
        name: friend.fullName,
        avatar: friend.avatarUrl ? { uri: friend.avatarUrl } : require("../assets/icon.png"),
      })
    })

    // Chuyển đổi map thành mảng sections cho SectionList
    const sectionArray = Object.keys(sections)
      .sort()
      .map((letter) => ({
        title: letter,
        data: sections[letter],
      }))

    return sectionArray
  }

  // Hàm refresh khi kéo xuống
  const onRefresh = () => {
    setRefreshing(true)
    if (activeTab === "friends") {
      fetchFriendData()
    } else {
      fetchGroupsData()
    }
  }

  // Cập nhật SPECIAL_SECTIONS để hiển thị số lượng lời mời kết bạn
  const SPECIAL_SECTIONS = [
    {
      id: "friend_requests",
      name: "Lời mời kết bạn",
      count: friendRequestCount > 0 ? `(${friendRequestCount})` : "",
      icon: "people",
      iconColor: "#0068FF",
      iconBgColor: "#0068FF20",
    },
    {
      id: "phone_contacts",
      name: "Danh bạ máy",
      description: "Các liên hệ có dùng Zalo",
      icon: "book",
      iconColor: "#0068FF",
      iconBgColor: "#0068FF20",
    },
  ]

  const renderSpecialSection = ({ item }) => (
    <TouchableOpacity
      style={styles.specialSection}
      onPress={() => {
        if (item.id === "friend_requests") {
          navigation.navigate("FriendRequestsScreen")
        } else if (item.id === "phone_contacts") {
          // Xử lý khi nhấn vào danh bạ máy
        }
      }}
    >
      <View style={[styles.specialSectionIcon, { backgroundColor: item.iconBgColor }]}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
      </View>
      <View style={styles.specialSectionContent}>
        <View style={styles.specialSectionHeader}>
          <Text style={styles.specialSectionName}>{item.name}</Text>
          {item.count && <Text style={styles.specialSectionCount}>{item.count}</Text>}
        </View>
        {item.description && <Text style={styles.specialSectionDescription}>{item.description}</Text>}
      </View>
    </TouchableOpacity>
  )

  // Add a function to check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId)
  }

  // Update the renderContactItem function to show online status
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={async () => {
        try {
          // Show loading indicator or some feedback
          // Get or create a conversation with this user
          const conversation = await messageService.getOrStartConversation(item.id)

          // Navigate to chat detail with the conversation data
          navigation.navigate("ChatDetail", {
            conversation: {
              id: conversation.conversationId || conversation._id,
              name: item.name,
              avatar: item.avatar?.uri,
              online: isUserOnline(item.id),
              isGroup: false,
            },
          })
        } catch (error) {
          console.error("Error starting conversation:", error)
          Alert.alert("Lỗi", "Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.")
        }
      }}
    >
      <View style={styles.avatarContainer}>
        <Image source={item.avatar} style={styles.contactAvatar} />
        {isUserOnline(item.id) && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={styles.contactName}>{item.name}</Text>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={22} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="videocam-outline" size={22} color="#888" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  )

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => {
        navigation.navigate("ChatDetail", {
          conversation: {
            id: item.id,
            name: item.name,
            avatar: item.avatarUrl,
            online: false,
            isGroup: true,
            members: item.members || [],
            description: item.description || "",
          },
        })
      }}
    >
      <View style={styles.groupAvatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
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
              <View style={styles.groupAvatarPlaceholder}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {item.memberCount > 0 && (
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCountText}>{item.memberCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {formatLastMessagePreview(item)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderCreateGroupButton = () => (
    <TouchableOpacity style={styles.createGroupButton} onPress={() => navigation.navigate("CreateGroupScreen")}>
      <View style={styles.createGroupIcon}>
        <Ionicons name="people" size={24} color="#0068FF" />
        <View style={styles.plusIconContainer}>
          <Ionicons name="add" size={14} color="#FFF" />
        </View>
      </View>
      <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
    </TouchableOpacity>
  )

  const renderGroupsHeader = () => (
    <View style={styles.groupsHeaderContainer}>
      <Text style={styles.groupsHeaderText}>
        Nhóm đang tham gia {groupsData.length > 0 ? `(${groupsData.length})` : ""}
      </Text>
      <TouchableOpacity style={styles.sortButton}>
        <Ionicons name="swap-vertical" size={20} color="#888" />
        <Text style={styles.sortButtonText}>Sắp xếp</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate("SearchScreen")}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#888" editable={false}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="person-add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "groups" && styles.activeTab]}
          onPress={() => setActiveTab("groups")}
        >
          <Text style={[styles.tabText, activeTab === "groups" && styles.activeTabText]}>Nhóm</Text>
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {activeTab === "friends" ? (
          <>
            <View style={styles.specialSectionsContainer}>
              <FlatList
                data={SPECIAL_SECTIONS}
                renderItem={renderSpecialSection}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.filtersContainer}>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === "all" && styles.activeFilterButton]}
                onPress={() => setActiveFilter("all")}
              >
                <Text style={[styles.filterText, activeFilter === "all" && styles.activeFilterText]}>
                  Tất cả {friendsData.reduce((total, section) => total + section.data.length, 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === "recent" && styles.activeFilterButton]}
                onPress={() => setActiveFilter("recent")}
              >
                <Text style={[styles.filterText, activeFilter === "recent" && styles.activeFilterText]}>
                  Mới truy cập
                </Text>
              </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0068FF" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchFriendData}>
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : friendsData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Bạn chưa có bạn bè nào</Text>
                <TouchableOpacity style={styles.addFriendButton} onPress={() => navigation.navigate("SearchScreen")}>
                  <Text style={styles.addFriendButtonText}>Tìm bạn bè</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <SectionList
                sections={friendsData}
                renderItem={renderContactItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                style={styles.sectionList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0068FF"]} />}
              />
            )}
          </>
        ) : (
          <>
            {renderCreateGroupButton()}
            {renderGroupsHeader()}

            {groupsLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0068FF" />
              </View>
            ) : groupsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{groupsError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchGroupsData}>
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : groupsData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào</Text>
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={() => navigation.navigate("CreateGroupScreen")}
                >
                  <Text style={styles.addFriendButtonText}>Tạo nhóm mới</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={groupsData}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.groupsList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0068FF"]} />}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="people" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Danh bạ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
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
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0068FF",
  },
  tabText: {
    color: "#888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "500",
  },
  specialSectionsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  specialSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  specialSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  specialSectionContent: {
    flex: 1,
  },
  specialSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  specialSectionName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  specialSectionCount: {
    color: "#888",
    fontSize: 16,
    marginLeft: 4,
  },
  specialSectionDescription: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#444",
  },
  filterText: {
    color: "#888",
    fontSize: 14,
  },
  activeFilterText: {
    color: "#FFF",
    fontSize: 14,
  },
  sectionList: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactName: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },
  contactActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  // Groups tab styles
  groupsList: {
    flex: 1,
  },
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  createGroupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0068FF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  plusIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0068FF",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  createGroupText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  groupsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  groupsHeaderText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonText: {
    color: "#888",
    fontSize: 14,
    marginLeft: 4,
  },
  groupItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  groupAvatarContainer: {
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
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  memberCountText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  groupContent: {
    flex: 1,
    justifyContent: "center",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    color: "#888",
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: "column",
  },
  lastMessageText: {
    color: "#888",
    fontSize: 14,
  },
  birthdayContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  birthdayIcon: {
    marginRight: 4,
  },
  birthdayText: {
    color: "#FF3B30",
    fontSize: 14,
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
  // Thêm styles mới
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0068FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  addFriendButton: {
    backgroundColor: "#0068FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addFriendButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  avatarContainer: { position: "relative" },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
})

export default ContactsScreen
