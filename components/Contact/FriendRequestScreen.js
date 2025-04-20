"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const FriendRequestScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("received")
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFriendRequests()
  }, [])

  const fetchFriendRequests = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API call
      setTimeout(() => {
        // Mock received requests
        const received = [
          {
            id: "1",
            name: "Nguyen Ngoc Dung",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            message: "Xin chào, mình là Nguyen Ngoc Dung. Mình biết bạn qua số điện thoại.",
            time: "1 ngày trước",
            source: "Tìm kiếm số điện thoại",
          },
          {
            id: "2",
            name: "Dũng",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            message: "Xin chào, mình là Dũng. Thấy bạn trong nhóm Điện máy Tlc và muốn kết bạn!",
            time: "2 ngày trước",
            source: "Bạn cùng nhóm",
          },
          {
            id: "3",
            name: "Bui Ngoc Thu",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            message: "Muốn kết bạn",
            time: "1 tuần trước",
            source: "",
          },
        ]

        // Mock sent requests (empty for now)
        const sent = []

        setReceivedRequests(received)
        setSentRequests(sent)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching friend requests:", error)
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API call
      setTimeout(() => {
        // Remove the request from the list
        setReceivedRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId))
        setIsLoading(false)

        // Show success message
        alert("Đã chấp nhận lời mời kết bạn")
      }, 500)
    } catch (error) {
      console.error("Error accepting friend request:", error)
      setIsLoading(false)
    }
  }

  const handleRejectRequest = async (requestId) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API call
      setTimeout(() => {
        // Remove the request from the list
        setReceivedRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId))
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      setIsLoading(false)
    }
  }

  const handleCancelSentRequest = async (requestId) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API call
      setTimeout(() => {
        // Remove the request from the list
        setSentRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId))
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error canceling friend request:", error)
      setIsLoading(false)
    }
  }

  const renderReceivedRequest = ({ item, index }) => {
    // Add a section header for month/year if this is the first item or date changes
    const showHeader = index === 0

    return (
      <>
        {showHeader && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Tháng 04, 2025</Text>
          </View>
        )}
        <View style={styles.requestItem}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />

          <View style={styles.requestContent}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestName}>{item.name}</Text>
              <Text style={styles.requestTime}>
                {item.time} • {item.source}
              </Text>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{item.message}</Text>
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
        </View>

        {/* Show "Cũ hơn" section after the last recent request */}
        {index === 1 && (
          <View style={styles.olderSection}>
            <Text style={styles.olderSectionText}>Cũ hơn</Text>
          </View>
        )}
      </>
    )
  }

  const renderSentRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestName}>{item.name}</Text>
          <Text style={styles.requestTime}>{item.time}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelSentRequest(item.id)}>
            <Text style={styles.cancelButtonText}>HỦY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderEmptySent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Image
          source={require("../../assets/empty-requests.png")}
          style={styles.emptyIcon}
          defaultSource={require("../../assets/empty-requests.png")}
        />
      </View>
      <Text style={styles.emptyText}>Chưa gửi lời mời kết bạn nào</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Lời mời kết bạn</Text>

        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "received" && styles.activeTabButton]}
          onPress={() => setActiveTab("received")}
        >
          <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>
            Đã nhận {receivedRequests.length > 0 ? receivedRequests.length : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "sent" && styles.activeTabButton]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>Đã gửi</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084FF" />
        </View>
      ) : activeTab === "received" ? (
        <FlatList
          data={receivedRequests}
          renderItem={renderReceivedRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestsList}
        />
      ) : sentRequests.length > 0 ? (
        <FlatList
          data={sentRequests}
          renderItem={renderSentRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestsList}
        />
      ) : (
        renderEmptySent()
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1A1A1A",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  settingsButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888888",
    fontSize: 14,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  requestsList: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
  },
  sectionHeaderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  requestItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
  },
  requestContent: {
    flex: 1,
    marginLeft: 12,
  },
  requestHeader: {
    marginBottom: 4,
  },
  requestName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  requestTime: {
    color: "#888888",
    fontSize: 12,
  },
  messageContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginRight: 8,
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  acceptButtonText: {
    color: "#0084FF",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#333333",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  olderSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
  },
  olderSectionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
  },
  emptyText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
  },
})

export default FriendRequestScreen
