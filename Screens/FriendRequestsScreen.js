"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { friendService } from "../services/friendService"
import { messageService } from "../services/messageService"

const FriendRequestsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("received")
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFriendRequests()
  }, [])

  const fetchFriendRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch received friend requests
      const receivedData = await friendService.getReceivedFriendRequests()
      setReceivedRequests(receivedData || [])

      // Fetch sent friend requests
      const sentData = await friendService.getSentFriendRequests()
      setSentRequests(sentData || [])
    } catch (err) {
      console.error("Error fetching friend requests:", err)
      setError("Không thể tải lời mời kết bạn. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchFriendRequests()
  }

  const handleAcceptRequest = async (request) => {
    try {
      setLoading(true)
  
      await friendService.respondToFriendRequest(request.requestId, "accept")

      try {
        await messageService.getOrStartConversation(request.sender.userId)
        console.log("Conversation created successfully with user:", request.sender.userId)
      } catch (convErr) {
        console.error("Error creating conversation:", convErr)
      }

      setReceivedRequests(receivedRequests.filter((req) => req.requestId !== request.requestId))
      Alert.alert(
        "Thành công",
        `Đã chấp nhận lời mời kết bạn từ ${request.sender?.fullName || "người dùng"} và tạo cuộc trò chuyện`,
      )
    } catch (err) {
      console.error("Error accepting friend request:", err)
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async (request) => {
    try {
      setLoading(true)
      await friendService.respondToFriendRequest(request.requestId, "reject")

      // Update local state
      setReceivedRequests(receivedRequests.filter((req) => req.requestId !== request.requestId))
      Alert.alert("Thành công", `Đã từ chối lời mời kết bạn từ ${request.sender?.fullName || "người dùng"}`)
    } catch (err) {
      console.error("Error rejecting friend request:", err)
      Alert.alert("Lỗi", "Không thể từ chối lời mời kết bạn. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawRequest = async (request) => {
    try {
      Alert.alert(
        "Thu hồi lời mời",
        `Bạn có chắc muốn thu hồi lời mời kết bạn đã gửi đến ${request.receiver?.fullName || "người dùng"}?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Thu hồi",
            onPress: async () => {
              setLoading(true)
              await friendService.withdrawFriendRequest(request.requestId)

              // Update local state
              setSentRequests(sentRequests.filter((req) => req.requestId !== request.requestId))
              Alert.alert("Thành công", "Đã thu hồi lời mời kết bạn")
            },
          },
        ],
      )
    } catch (err) {
      console.error("Error withdrawing friend request:", err)
      Alert.alert("Lỗi", "Không thể thu hồi lời mời kết bạn. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (userId, fullName, avatarUrl) => {
    try {
      setLoading(true)
      const conversation = await messageService.getOrStartConversation(userId)

      navigation.navigate("ChatDetail", {
        conversation: {
          id: conversation.conversationId,
          name: fullName,
          avatar: avatarUrl,
          isGroup: false,
          online: false,
        },
      })
    } catch (err) {
      console.error("Error starting chat:", err)
      Alert.alert("Lỗi", "Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const renderReceivedRequestItem = ({ item }) => {
    return (
      <View style={styles.requestItem}>
        <Image
          source={item.sender?.avatarUrl ? { uri: item.sender.avatarUrl } : require("../assets/icon.png")}
          style={styles.avatar}
        />
        <View style={styles.requestContent}>
          <Text style={styles.requestName}>{item.sender?.fullName || "Người dùng"}</Text>
          <Text style={styles.requestMessage}>{item.message || "Muốn kết bạn với bạn"}</Text>
          <Text style={styles.requestTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item)}>
            <Text style={styles.rejectButtonText}>TỪ CHỐI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item)}>
            <Text style={styles.acceptButtonText}>ĐỒNG Ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderSentRequestItem = ({ item }) => {
    return (
      <View style={styles.requestItem}>
        <Image
          source={item.receiver?.avatarUrl ? { uri: item.receiver.avatarUrl } : require("../assets/icon.png")}
          style={styles.avatar}
        />
        <View style={styles.requestContent}>
          <Text style={styles.requestName}>{item.receiver?.fullName || "Người dùng"}</Text>
          <Text style={styles.requestMessage}>{item.message || "Đã gửi lời mời kết bạn"}</Text>
          <Text style={styles.requestTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.withdrawButton} onPress={() => handleWithdrawRequest(item)}>
          <Text style={styles.withdrawButtonText}>THU HỒI</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderEmptyReceivedState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require("../assets/empty-receive.png")} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Không có lời mời kết bạn nào</Text>
    </View>
  )

  const renderEmptySentState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require("../assets/empty-send.png")} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Chưa gửi lời mời kết bạn nào</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lời mời kết bạn</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>
            Đã nhận {receivedRequests.length > 0 ? `(${receivedRequests.length})` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>
            Đã gửi {sentRequests.length > 0 ? `(${sentRequests.length})` : ""}
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchFriendRequests}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === "received" ? (
            receivedRequests.length > 0 ? (
              <FlatList
                data={receivedRequests}
                renderItem={renderReceivedRequestItem}
                keyExtractor={(item) => item.requestId}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0068FF"]} />}
              />
            ) : (
              renderEmptyReceivedState()
            )
          ) : sentRequests.length > 0 ? (
            <FlatList
              data={sentRequests}
              renderItem={renderSentRequestItem}
              keyExtractor={(item) => item.requestId}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0068FF"]} />}
            />
          ) : (
            renderEmptySentState()
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  settingsButton: {
    padding: 4,
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
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
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
    color: "#FFFFFF",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    
  },
  emptyIcon: {
    width: 160,
    height: 120,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  requestItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  requestContent: {
    flex: 1,
  },
  requestName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  requestMessage: {
    color: "#888",
    fontSize: 14,
  },
  requestTime: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 8,
    width: 100,
  },
  rejectButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#0068FF",
    fontSize: 14,
  },
  withdrawButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
})

export default FriendRequestsScreen
