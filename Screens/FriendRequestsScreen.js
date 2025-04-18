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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const FriendRequestsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("received")
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFriendRequests()
  }, [])

  const fetchFriendRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, these would be API calls
      // For demo purposes, we'll use mock data
      const mockReceivedRequests = [
        {
          id: "1",
          name: "Nguyễn Văn Chi",
          avatar: require("../assets/icon.png"),
          message: "Muốn kết bạn",
          timestamp: new Date(),
        },
        {
          id: "2",
          name: "Diana",
          avatar: require("../assets/icon.png"),
          message: "Muốn kết bạn",
          timestamp: new Date(),
        },
        {
          id: "3",
          name: "Hạnh Sino",
          avatar: require("../assets/icon.png"),
          message: "Muốn kết bạn",
          timestamp: new Date(),
        },
      ]

      const mockSentRequests = [
        {
          id: "4",
          name: "Itel",
          avatar: null,
          message: "Tìm kiếm số điện thoại",
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
        },
      ]

      setReceivedRequests(mockReceivedRequests)
      setSentRequests(mockSentRequests)
    } catch (err) {
      console.error("Error fetching friend requests:", err)
      setError("Không thể tải lời mời kết bạn. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      // await friendService.respondToFriendRequest(requestId, 'accept');

      // Update local state
      setReceivedRequests(receivedRequests.filter((request) => request.id !== requestId))
    } catch (err) {
      console.error("Error accepting friend request:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      // await friendService.respondToFriendRequest(requestId, 'reject');

      // Update local state
      setReceivedRequests(receivedRequests.filter((request) => request.id !== requestId))
    } catch (err) {
      console.error("Error rejecting friend request:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawRequest = async (requestId) => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      // await friendService.withdrawFriendRequest(requestId);

      // Update local state
      setSentRequests(sentRequests.filter((request) => request.id !== requestId))
    } catch (err) {
      console.error("Error withdrawing friend request:", err)
    } finally {
      setLoading(false)
    }
  }

  const renderReceivedRequestItem = ({ item }) => {
    // Regular friend request
    return (
      <View style={styles.requestItem}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.requestContent}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestMessage}>{item.message}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item.id)}>
            <Text style={styles.rejectButtonText}>TỪ CHỐI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item.id)}>
            <Text style={styles.acceptButtonText}>ĐỒNG Ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderSentRequestItem = ({ item }) => {
    // Special case for "Itel" with different UI
    if (item.name === "Itel") {
      return (
        <View style={styles.requestItem}>
          <View style={[styles.avatarContainer, { backgroundColor: "#FF6B6B" }]}>
            <Text style={styles.avatarInitial}>I</Text>
          </View>
          <View style={styles.requestContent}>
            <Text style={styles.requestName}>{item.name}</Text>
            <Text style={styles.requestMessage}>{item.message}</Text>
            <Text style={styles.requestTime}>1 phút trước</Text>
          </View>
          <TouchableOpacity style={styles.withdrawButton} onPress={() => handleWithdrawRequest(item.id)}>
            <Text style={styles.withdrawButtonText}>THU HỒI</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // Regular sent request
    return (
      <View style={styles.requestItem}>
        <Image source={item.avatar || require("../assets/icon.png")} style={styles.avatar} />
        <View style={styles.requestContent}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <TouchableOpacity style={styles.withdrawButton} onPress={() => handleWithdrawRequest(item.id)}>
          <Text style={styles.withdrawButtonText}>THU HỒI</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderEmptyReceivedState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require("../assets/icon.png")} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Không có lời mời kết bạn nào</Text>
    </View>
  )

  const renderEmptySentState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require("../assets/icon.png")} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Chưa gửi lời mời kết bạn nào</Text>
    </View>
  )

  const renderOlderRequests = () => {
    if (receivedRequests.length > 3) {
      return (
        <View>
          <Text style={styles.olderRequestsHeader}>Cũ hơn</Text>
          {/* Additional requests would be rendered here */}
        </View>
      )
    }
    return null
  }

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
            Đã nhận {receivedRequests.length > 0 ? receivedRequests.length : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>
            Đã gửi {sentRequests.length > 0 ? sentRequests.length : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
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
                keyExtractor={(item) => item.id}
                ListFooterComponent={renderOlderRequests}
              />
            ) : (
              renderEmptyReceivedState()
            )
          ) : sentRequests.length > 0 ? (
            <FlatList data={sentRequests} renderItem={renderSentRequestItem} keyExtractor={(item) => item.id} />
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
    width: 120,
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
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
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
  olderRequestsHeader: {
    color: "#888",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#222",
  },
})

export default FriendRequestsScreen
