"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { userService } from "../services/userService"
import { friendService } from "../services/friendService"
import { messageService } from "../services/messageService"

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchUsers()
    } else if (searchQuery.length === 0) {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const users = await userService.searchUsers(searchQuery)

      // For each user, check friendship status
      const resultsWithStatus = await Promise.all(
        users.map(async (user) => {
          try {
            const statusData = await friendService.checkFriendshipStatus(user.userId)
            return {
              ...user,
              friendshipStatus: statusData.status,
              requestId: statusData.requestId,
            }
          } catch (err) {
            console.error(`Error checking friendship status for user ${user.userId}:`, err)
            return {
              ...user,
              friendshipStatus: "not_friends",
            }
          }
        }),
      )

      setSearchResults(resultsWithStatus)
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search users")
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  const handleFriendAction = async (user) => {
    try {
      switch (user.friendshipStatus) {
        case "not_friends":
          // Send friend request
          await friendService.sendFriendRequest(user.userId)
          updateUserStatus(user.userId, "pending_sent", null)
          break

        case "pending_sent":
          // Show cancel confirmation
          Alert.alert("Hủy yêu cầu kết bạn", `Bạn có chắc muốn hủy yêu cầu kết bạn với ${user.fullName}?`, [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Xác nhận",
              onPress: async () => {
                // Cancel friend request logic would go here
                // Since the API doesn't have a specific endpoint for this in the guide,
                // we'll just update the UI for now
                updateUserStatus(user.userId, "not_friends", null)
              },
            },
          ])
          break

        case "pending_received":
          // Show accept/reject options
          Alert.alert("Yêu cầu kết bạn", `Bạn muốn chấp nhận yêu cầu kết bạn từ ${user.fullName}?`, [
            {
              text: "Từ chối",
              onPress: async () => {
                await friendService.respondToFriendRequest(user.requestId, "reject")
                updateUserStatus(user.userId, "not_friends", null)
              },
              style: "cancel",
            },
            {
              text: "Chấp nhận",
              onPress: async () => {
                await friendService.respondToFriendRequest(user.requestId, "accept")
                updateUserStatus(user.userId, "friends", null)
              },
            },
          ])
          break

        case "friends":
          // Navigate to chat with this friend
          const conversation = await messageService.getOrStartConversation(user.userId)
          console.log("Starting conversation:", conversation)
          navigation.navigate("ChatDetail", {
            conversation: {
              id: conversation.conversationId,
              name: user.fullName,
              avatar: user.avatarUrl,
              isGroup: false,
              online: false,
            },
          })
          break
      }
    } catch (err) {
      console.error("Friend action error:", err)
      Alert.alert("Lỗi", "Không thể thực hiện hành động. Vui lòng thử lại sau.")
    }
  }

  const updateUserStatus = (userId, newStatus, requestId) => {
    setSearchResults((prevResults) =>
      prevResults.map((user) => (user.userId === userId ? { ...user, friendshipStatus: newStatus, requestId } : user)),
    )
  }

  const getFriendActionButton = (status) => {
    switch (status) {
      case "not_friends":
        return { text: "KẾT BẠN", color: "#0068FF" }
      case "pending_sent":
        return { text: "HỦY YÊU CẦU", color: "#FF3B30" }
      case "pending_received":
        return { text: "PHẢN HỒI", color: "#0068FF" }
      case "friends":
        return { text: "NHẮN TIN", color: "#0068FF" }
      default:
        return { text: "KẾT BẠN", color: "#0068FF" }
    }
  }

  const renderContactItem = ({ item }) => {
    const buttonInfo = getFriendActionButton(item.friendshipStatus)

    return (
      <View style={styles.contactItem}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.initialsAvatar, { backgroundColor: "#FF6B6B" }]}>
            <Text style={styles.initialsText}>
              {item.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.fullName}</Text>
          <Text style={styles.contactPhone}>
            {item.phone ? `Số điện thoại: ${item.phone}` : `Email: ${item.email}`}
          </Text>
        </View>

        {item.friendshipStatus !== "friends" && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: buttonInfo.color }]}
            onPress={() => handleFriendAction(item)}
          >
            <Text style={[styles.actionButtonText, { color: buttonInfo.color }]}>{buttonInfo.text}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <View style={styles.clearButtonCircle}>
                <Ionicons name="close" size={16} color="#888" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.qrButton}>
          <Ionicons name="qr-code" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0068FF" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={searchUsers}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kết quả tìm kiếm ({searchResults.length})</Text>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.userId.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy kết quả nào</Text>
          </View>
        ) : (
          <View style={styles.initialContainer}>
            <Text style={styles.initialText}>Nhập tên hoặc số điện thoại để tìm kiếm</Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
  },
  qrButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  initialContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  initialText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  contactPhone: {
    color: "#888888",
    fontSize: 14,
    marginTop: 2,
  },
  actionButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default SearchScreen
