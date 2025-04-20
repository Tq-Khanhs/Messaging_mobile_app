"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { Ionicons } from "@expo/vector-icons"

const ContactSearch = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const searchInputRef = useRef(null)

  // Mock data for demonstration
  const allUsers = [
    {
      id: "1",
      name: "Trần Quốc Khánh",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      isFriend: true,
    },
    {
      id: "2",
      name: "Anh Khánh",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      isFriend: true,
    },
    {
      id: "3",
      name: "Khánh Lâm",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      isFriend: true,
    },
    {
      id: "4",
      name: "Khánh Duy",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      isFriend: true,
    },
    {
      id: "5",
      name: "Khánh Nhật",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      isFriend: false,
    },
    {
      id: "6",
      name: "Nhóm 12 _ CNM",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      isGroup: true,
      members: 5,
    },
    {
      id: "7",
      name: "Nguyễn Văn An",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      isFriend: false,
    },
    {
      id: "8",
      name: "Trần Thị Bình",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      isFriend: true,
    },
    {
      id: "9",
      name: "Lê Văn Cường",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
      isFriend: true,
    },
    {
      id: "10",
      name: "Phạm Thị Dung",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      isFriend: false,
      email: "dungpt@example.com",
    },
  ]

  // Real-time search function
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    try {
      // Create regex pattern from query - case insensitive
      const pattern = new RegExp(query.trim(), "i")

      // Filter users based on regex match in name or email
      const results = allUsers.filter((user) => pattern.test(user.name) || (user.email && pattern.test(user.email)))

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Focus the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100)
    }
  }, [])

  // Handle search query changes in real-time
  useEffect(() => {
    handleSearch(searchQuery)
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  const handleAddFriend = (userId) => {
    // Mock API call to send friend request
    console.log(`Sending friend request to user ${userId}`)
    // Show success message
    alert("Đã gửi lời mời kết bạn")
  }

  const handleMessage = (contact) => {
    navigation.navigate("ChatDetail", { contact })
  }

  const renderSearchResult = ({ item }) => {
    // Highlight the matching part of the name using regex
    let nameParts = []

    if (searchQuery.trim()) {
      // Create regex with global and case insensitive flags
      const regex = new RegExp(`(${searchQuery.trim()})`, "gi")
      nameParts = item.name.split(regex)

      // Filter out empty strings that might result from the split
      nameParts = nameParts.filter((part) => part !== "")
    } else {
      nameParts = [item.name]
    }

    return (
      <View style={styles.resultItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>
            {nameParts.map((part, index) => {
              // Check if this part matches the search query (case insensitive)
              const isMatch = searchQuery.trim() && part.toLowerCase() === searchQuery.trim().toLowerCase()

              return (
                <Text key={index} style={isMatch ? styles.highlightedText : null}>
                  {part}
                </Text>
              )
            })}
          </Text>

          {item.isGroup && <Text style={styles.groupInfo}>Nhóm</Text>}
        </View>

        {item.isGroup ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleMessage(item)}>
            <Ionicons name="chatbubble-outline" size={24} color="#0084FF" />
          </TouchableOpacity>
        ) : item.isFriend ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleMessage(item)}>
            <Ionicons name="call" size={24} color="#0084FF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addFriendButton} onPress={() => handleAddFriend(item.id)}>
            <Text style={styles.addFriendText}>KẾT BẠN</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderTabButton = (tabName, label) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTabButton]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888888" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888888"
            autoFocus={true}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon name="close" size={20} color="#888888" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.qrButton}>
          <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton("all", "Tất cả")}
        {renderTabButton("contacts", "Liên hệ")}
        {renderTabButton("messages", "Tin nhắn")}
        {renderTabButton("discover", "Khám phá")}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084FF" />
        </View>
      ) : searchResults.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Liên hệ ({searchResults.filter((r) => !r.isGroup).length})</Text>
          </View>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
          />
        </>
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={64} color="#666666" />
          <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
        </View>
      ) : (
        <View style={styles.initialStateContainer}>
          <Icon name="search" size={64} color="#666666" />
          <Text style={styles.initialStateText}>Nhập tên để tìm kiếm</Text>
        </View>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#1A1A1A",
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 8,
    height: 40,
  },
  qrButton: {
    padding: 8,
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
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  resultsTitle: {
    color: "#888888",
    fontSize: 14,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
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
    backgroundColor: "#333333",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 2,
  },
  highlightedText: {
    color: "#0084FF",
    fontWeight: "500",
  },
  groupInfo: {
    color: "#888888",
    fontSize: 14,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  addFriendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  addFriendText: {
    color: "#0084FF",
    fontSize: 14,
    fontWeight: "500",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noResultsText: {
    color: "#888888",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  initialStateText: {
    color: "#888888",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
})

export default ContactSearch
