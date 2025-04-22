import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  SectionList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { groupService } from "../services/groupService"
import { friendService } from "../services/friendService"

const AddGroupMembersScreen = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState([])
  const [filteredFriends, setFilteredFriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [sections, setSections] = useState([])
  const [groupId, setGroupId] = useState(null)

  const route = useRoute()
  const navigation = useNavigation()
  const { conversation } = route.params || {}
  const { user } = useAuth()

  // Fetch group details and friends
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get group ID from conversation
        if (conversation && conversation.id) {
          const groupDetails = await groupService.getGroupByConversationId(conversation.id)
          setGroupId(groupDetails.group.groupId)
        }

        // Get friends list
        const friendsData = await friendService.getFriends()
        
        // Filter out friends who are already in the group
        const existingMemberIds = conversation?.members?.map(member => member.userId) || []
        const availableFriends = friendsData.filter(friend => !existingMemberIds.includes(friend.userId))
        
        setFriends(availableFriends)
        organizeIntoSections(availableFriends)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [conversation])

  // Organize friends into alphabetical sections
  const organizeIntoSections = (friendsList) => {
    // Group friends by first letter of their name
    const groupedFriends = friendsList.reduce((acc, friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(friend)
      return acc
    }, {})

    // Convert to array of sections
    const sectionsArray = Object.keys(groupedFriends)
      .sort()
      .map(letter => ({
        title: letter,
        data: groupedFriends[letter].sort((a, b) => a.fullName.localeCompare(b.fullName))
      }))

    setSections(sectionsArray)
    setFilteredFriends(friendsList)
  }

  // Handle search
  const handleSearch = (text) => {
    setSearchQuery(text)
    if (text.trim() === "") {
      setFilteredFriends(friends)
      organizeIntoSections(friends)
    } else {
      const filtered = friends.filter(friend => 
        friend.fullName.toLowerCase().includes(text.toLowerCase()) ||
        (friend.username && friend.username.toLowerCase().includes(text.toLowerCase()))
      )
      setFilteredFriends(filtered)
      organizeIntoSections(filtered)
    }
  }

  // Toggle friend selection
  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prevSelected => {
      const isAlreadySelected = prevSelected.some(f => f.userId === friend.userId)
      
      if (isAlreadySelected) {
        return prevSelected.filter(f => f.userId !== friend.userId)
      } else {
        return [...prevSelected, friend]
      }
    })
  }

  // Add selected friends to group
  const addMembersToGroup = async () => {
    if (selectedFriends.length === 0) return
    
    try {
      setLoading(true)
      
      if (!groupId) {
        throw new Error("Group ID not found")
      }
      
      const memberIds = selectedFriends.map(friend => friend.userId)
      await groupService.addGroupMembers(groupId, memberIds)
      
      Alert.alert(
        "Thành công",
        "Đã thêm thành viên vào nhóm",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      )
    } catch (err) {
      console.error("Error adding members:", err)
      Alert.alert("Lỗi", "Không thể thêm thành viên. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Remove a selected friend
  const removeSelectedFriend = (friendId) => {
    setSelectedFriends(prevSelected => prevSelected.filter(f => f.userId !== friendId))
  }

  // Render friend item
  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.some(friend => friend.userId === item.userId)
    
    return (
      <TouchableOpacity 
        style={styles.friendItem}
        onPress={() => toggleFriendSelection(item)}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: "#0068FF" }]}>
            <Text style={styles.avatarInitial}>
              {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
        )}
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.fullName}</Text>
          {item.username && (
            <Text style={styles.friendUsername}>@{item.username}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}
          onPress={() => toggleFriendSelection(item)}
        >
          {isSelected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  )

  if (loading && !friends.length) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0068FF" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
          <Text style={styles.headerTitle}>Thêm vào nhóm</Text>
          <Text style={styles.selectedCount}>
            {selectedFriends.length > 0 ? `Đã chọn: ${selectedFriends.length}` : ""}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#888888" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Friends List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.userId}
        renderItem={renderFriendItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "Không tìm thấy kết quả" : "Không có bạn bè nào để thêm vào nhóm"}
            </Text>
          </View>
        }
      />
      
      {/* Selected Friends Bar */}
      {selectedFriends.length > 0 && (
        <View style={styles.selectedBar}>
          <View style={styles.selectedAvatarsContainer}>
            {selectedFriends.map((friend) => (
              <View key={friend.userId} style={styles.selectedAvatarWrapper}>
                {friend.avatarUrl ? (
                  <Image source={{ uri: friend.avatarUrl }} style={styles.selectedAvatar} />
                ) : (
                  <View style={[styles.selectedAvatar, { backgroundColor: "#0068FF" }]}>
                    <Text style={styles.selectedAvatarInitial}>
                      {friend.fullName ? friend.fullName.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.removeSelectedButton}
                  onPress={() => removeSelectedFriend(friend.userId)}
                >
                  <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={addMembersToGroup}
            disabled={selectedFriends.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Thành viên mới xem được tin gửi gần đây</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  selectedCount: {
    color: "#888888",
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
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
  },
  sectionHeader: {
    backgroundColor: "#111111",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: "#0068FF",
    fontSize: 16,
    fontWeight: "600",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  friendUsername: {
    color: "#888888",
    fontSize: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#888888",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleSelected: {
    backgroundColor: "#0068FF",
    borderColor: "#0068FF",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
  },
  selectedBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  selectedAvatarsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedAvatarWrapper: {
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedAvatarInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    alignItems: "center",
  },
  infoText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
})

export default AddGroupMembersScreen
