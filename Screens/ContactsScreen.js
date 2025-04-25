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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { friendService } from "../services/friendService"

// Add imports at the top
import { useSocket } from "../context/SocketContext"

// Xóa CONTACTS_DATA mẫu và thay thế bằng state

const GROUPS_DATA = [
  {
    id: "1",
    name: "Nhóm 12 _ CNM",
    lastMessage: "Bạn: Phần backend ai thc hiện z á @All",
    time: "30 phút",
    memberCount: 5,
    avatars: [require("../assets/icon.png"), require("../assets/icon.png")],
  },
  {
    id: "2",
    name: "Nhóm 8 TTĐT_TH(1-3)",
    lastMessage: "[Hình ảnh]",
    time: "1 giờ",
    memberCount: 5,
    avatars: [require("../assets/icon.png"), require("../assets/icon.png")],
  },
  {
    id: "3",
    name: "NOW_TH_T3_10_12_KTTKPM",
    lastMessage: "Hôm nay (17/03) là sinh nhật của Nhựt Anh Nguyễn,...",
    time: "13 giờ",
    memberCount: 30,
    avatars: [require("../assets/icon.png"), require("../assets/icon.png")],
  },
]

const ContactsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("friends")
  const [activeFilter, setActiveFilter] = useState("all")
  const [friendRequestCount, setFriendRequestCount] = useState(0)

  // Thêm state cho danh sách bạn bè
  const [friendsData, setFriendsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Inside the ContactsScreen component, add these hooks
  const { isConnected, onlineUsers, addListener, removeListener } = useSocket()

  // Thm useEffect để lấy danh sách bạn bè và số lượng lời mời kết bạn
  useEffect(() => {
    fetchFriendData()
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

    // Register event listeners
    const unsubscribeFriendRequest = addListener("friend_request", friendRequestHandler)
    const unsubscribeFriendResponse = addListener("friend_request_response", friendRequestResponseHandler)

    // Clean up listeners on unmount
    return () => {
      unsubscribeFriendRequest()
      unsubscribeFriendResponse()
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
    fetchFriendData()
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
    <View style={styles.contactItem}>
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
    </View>
  )

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  )

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={styles.groupItem}>
      <View style={styles.groupAvatarContainer}>
        {item.avatars.slice(0, 2).map((avatar, index) => (
          <Image key={index} source={avatar} style={[styles.groupAvatar, index === 1 && styles.groupAvatarOverlap]} />
        ))}
        <View style={styles.memberCountBadge}>
          <Text style={styles.memberCountText}>{item.memberCount}</Text>
        </View>
      </View>

      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.messageContainer}>
          {item.hasBirthday && (
            <View style={styles.birthdayContainer}>
              <Ionicons name="gift" size={16} color="#FF3B30" style={styles.birthdayIcon} />
              <Text style={styles.birthdayText} numberOfLines={1}>
                {item.birthdayMessage}
              </Text>
            </View>
          )}
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderCreateGroupButton = () => (
    <TouchableOpacity style={styles.createGroupButton}>
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
      <Text style={styles.groupsHeaderText}>Nhóm đang tham gia (61)</Text>
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
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#888" />
        </View>
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

            <FlatList
              data={GROUPS_DATA}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            />
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
    width: 50,
    height: 50,
    marginRight: 12,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  groupAvatarOverlap: {
    top: 10,
    left: 10,
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
