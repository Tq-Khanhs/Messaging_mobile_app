"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SectionList,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { friendService } from "../services/friendService"
import { groupService } from "../services/groupService"

const { width } = Dimensions.get("window")

const CreateGroupScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("contacts") // 'recent' or 'contacts'
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState([])
  const [sections, setSections] = useState([])
  // Update the state to track selected friends
  const [selectedFriends, setSelectedFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [error, setError] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (friends.length > 0) {
      organizeFriendsIntoSections()
    }
  }, [friends, searchQuery])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const friendsList = await friendService.getFriends()
      setFriends(friendsList || [])
    } catch (err) {
      console.error("Error fetching friends:", err)
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const organizeFriendsIntoSections = () => {
    // Filter friends based on search query
    const filteredFriends =
      searchQuery.trim() === ""
        ? friends
        : friends.filter((friend) => friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()))

    // Group friends by first letter
    const groupedFriends = filteredFriends.reduce((acc, friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(friend)
      return acc
    }, {})

    // Convert to sections format
    const sectionsArray = Object.keys(groupedFriends)
      .sort()
      .map((letter) => ({
        title: letter,
        data: groupedFriends[letter],
      }))

    setSections(sectionsArray)
  }

  // Update the toggleSelectFriend function to track selected friends
  const toggleSelectFriend = (friend) => {
    if (selectedFriends.some((f) => f.userId === friend.userId)) {
      setSelectedFriends(selectedFriends.filter((f) => f.userId !== friend.userId))
    } else {
      setSelectedFriends([...selectedFriends, friend])
    }
  }

  // Update the handleCreateGroup function to navigate back with a refresh parameter
  const handleCreateGroup = async () => {
    // Validate inputs
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm")
      return
    }

    if (selectedFriends.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một thành viên")
      return
    }

    try {
      setIsCreatingGroup(true)

      // Extract user IDs from selected friends
      const memberIds = selectedFriends.map((friend) => friend.userId)

      // Create group data object
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || "Nhóm chat mới",
        memberIds: memberIds,
      }

      // Call API to create group
      const createdGroup = await groupService.createGroup(groupData)

      // Show success message
      Alert.alert("Thành công", `Đã tạo nhóm "${groupName}" với ${selectedFriends.length} thành viên`, [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to message screen with refresh parameter
            navigation.navigate("MessagesScreen", {
              refreshConversations: true,
              newGroupId: createdGroup.conversationId,
            })
          },
        },
      ])
    } catch (error) {
      console.error("Error creating group:", error)
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại sau.", [{ text: "OK" }])
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  )

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendItem} onPress={() => toggleSelectFriend(item)} activeOpacity={0.7}>
      <Image source={item.avatarUrl ? { uri: item.avatarUrl } : require("../assets/icon.png")} style={styles.avatar} />
      <Text style={styles.friendName}>{item.fullName}</Text>
      <View style={styles.checkboxContainer}>
        <View
          style={[styles.checkbox, selectedFriends.some((f) => f.userId === item.userId) && styles.checkboxSelected]}
        />
      </View>
    </TouchableOpacity>
  )

  // Add this new component for the selected friends bar at the bottom
  const renderSelectedFriendsBar = () => {
    if (selectedFriends.length === 0) return null

    return (
      <View style={styles.selectedFriendsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedFriendsScroll}>
          {selectedFriends.map((friend) => (
            <View key={friend.userId} style={styles.selectedFriendItem}>
              <Image
                source={friend.avatarUrl ? { uri: friend.avatarUrl } : require("../assets/icon.png")}
                style={styles.selectedFriendAvatar}
              />
              <TouchableOpacity style={styles.removeSelectedButton} onPress={() => toggleSelectFriend(friend)}>
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.createGroupActionButton} onPress={handleCreateGroup} disabled={isCreatingGroup}>
          {isCreatingGroup ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nhóm mới</Text>
          <Text style={styles.selectedCount}>Đã chọn: {selectedFriends.length}</Text>
        </View>
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameContainer}>
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera-outline" size={24} color="#888888" />
        </View>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Đặt tên nhóm"
          placeholderTextColor="#888888"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Group Description Input (New) */}
      <View style={styles.groupDescriptionContainer}>
        <TextInput
          style={styles.groupDescriptionInput}
          placeholder="Mô tả nhóm (tùy chọn)"
          placeholderTextColor="#888888"
          value={groupDescription}
          onChangeText={setGroupDescription}
          multiline={true}
          numberOfLines={2}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#888888" />
          </TouchableOpacity>
        )}
        <Text style={styles.keyboardKey}>123</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "contacts" && styles.activeTab]}
          onPress={() => setActiveTab("contacts")}
        >
          <Text style={[styles.tabText, activeTab === "contacts" && styles.activeTabText]}>DANH BẠ</Text>
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0068FF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFriends}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== "" ? "Không tìm thấy bạn bè nào phù hợp" : "Bạn chưa có bạn bè nào"}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderFriendItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.userId}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={true}
        />
      )}
      {renderSelectedFriendsBar()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  selectedCount: {
    color: "#888888",
    fontSize: 14,
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  cameraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupNameInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  // New styles for group description
  groupDescriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  groupDescriptionInput: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlignVertical: "top",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 0,
  },
  keyboardKey: {
    color: "#888888",
    fontSize: 14,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
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
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
  },
  sectionHeader: {
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#888888",
  },
  checkboxSelected: {
    backgroundColor: "#0068FF",
    borderColor: "#0068FF",
  },
  selectedFriendsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  selectedFriendsScroll: {
    flex: 1,
  },
  selectedFriendItem: {
    marginRight: 10,
    position: "relative",
  },
  selectedFriendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  removeSelectedButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#333333",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  createGroupActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
})

export default CreateGroupScreen
