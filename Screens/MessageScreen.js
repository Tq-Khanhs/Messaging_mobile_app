import { useState, useEffect, useRef } from "react"
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
import socketService from "../services/socketService"
import { SOCKET_EVENTS } from "../config/constants"

const MessagesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("priority")
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const flatListRef = useRef(null)

  // Define event handlers at component level so they're accessible in both setup and cleanup
  const messageHandler = (data) => {
    try {
      console.log('New message received:', data);
      if (data && data.conversationId) {
        console.log('Fetching conversations after new message');
        fetchConversations();
      } else {
        console.warn('Received invalid message data:', data);
      }
    } catch (error) {
      console.error('Error handling new message:', error);
    }
  };

  const messageReadHandler = (data) => {
    try {
      console.log('Message read event:', data);
      if (data && (data.messageId || data.conversationId)) {
        fetchConversations();
      } else {
        console.warn('Received invalid message read data:', data);
      }
    } catch (error) {
      console.error('Error handling message read:', error);
    }
  };

  const messageDeletedHandler = (data) => {
    try {
      console.log('Message deleted event:', data);
      if (data && data.messageId) {
        // Update the conversation list to show message as deleted
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            if (conv.lastMessage && conv.lastMessage.messageId === data.messageId) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  isDeleted: true,
                  content: "Tin nhắn đã bị xóa"
                }
              };
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error('Error handling message delete:', error);
    }
  };

  const messageRecalledHandler = (data) => {
    try {
      console.log('Message recalled event:', data);
      if (data && data.messageId) {
        // Update the conversation list to show message as recalled
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            if (conv.lastMessage && conv.lastMessage.messageId === data.messageId) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  isRecalled: true,
                  content: "Tin nhắn đã bị thu hồi"
                }
              };
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error('Error handling message recall:', error);
    }
  };

  const userStatusHandler = (data) => {
    try {
      console.log('User status changed:', data);
      if (data && data.userId) {
        fetchConversations();
      } else {
        console.warn('Received invalid user status data:', data);
      }
    } catch (error) {
      console.error('Error handling user status:', error);
    }
  };

  const groupCreatedHandler = (data) => {
    try {
      console.log('New group created:', data);
      if (data && data.groupId) {
        fetchConversations();
      } else {
        console.warn('Received invalid group created data:', data);
      }
    } catch (error) {
      console.error('Error handling group creation:', error);
    }
  };

  const groupAddedHandler = (data) => {
    try {
      console.log('Added to group:', data);
      if (data && data.groupId) {
        fetchConversations();
      } else {
        console.warn('Received invalid group added data:', data);
      }
    } catch (error) {
      console.error('Error handling group addition:', error);
    }
  };

  // Toggle the dropdown menu
  const toggleDropdownMenu = () => {
    setShowDropdownMenu(!showDropdownMenu)
  }

  // Initialize socket connection
  const initializeSocket = async () => {
    try {
      setLoading(true);
      console.log("Initializing socket connection...");
      const success = await socketService.init();
      
      if (success) {
        console.log("Socket initialized successfully");
        setSocketConnected(true);
        // Only set up listeners after successful connection
        setupSocketListeners();
      } else {
        console.error("Failed to initialize socket");
        setSocketConnected(false);
        setError("Không thể kết nối với máy chủ");
      }
    } catch (error) {
      console.error("Error connecting to socket:", error);
      setSocketConnected(false);
      setError("Lỗi kết nối với máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Setup socket event listeners
  const setupSocketListeners = () => {
    if (!socketService.isConnected) {
      console.log("Socket not connected, cannot setup listeners");
      return;
    }

    console.log("Setting up socket listeners");
    
    try {
      socketService.on(SOCKET_EVENTS.NEW_MESSAGE, messageHandler);
      socketService.on(SOCKET_EVENTS.MESSAGE_READ, messageReadHandler);
      socketService.on(SOCKET_EVENTS.MESSAGE_DELETED, messageDeletedHandler);
      socketService.on(SOCKET_EVENTS.MESSAGE_RECALLED, messageRecalledHandler);
      socketService.on(SOCKET_EVENTS.USER_STATUS, userStatusHandler);
      socketService.on(SOCKET_EVENTS.GROUP_CREATED, groupCreatedHandler);
      socketService.on(SOCKET_EVENTS.GROUP_ADDED, groupAddedHandler);
      console.log("Successfully set up all socket listeners");
    } catch (error) {
      console.error("Error setting up socket listeners:", error);
    }
  };

  // Clean up socket listeners
  const cleanupSocketListeners = () => {
    console.log("Cleaning up socket listeners");
    try {
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, messageHandler);
      socketService.off(SOCKET_EVENTS.MESSAGE_READ, messageReadHandler);
      socketService.off(SOCKET_EVENTS.MESSAGE_DELETED, messageDeletedHandler);
      socketService.off(SOCKET_EVENTS.MESSAGE_RECALLED, messageRecalledHandler);
      socketService.off(SOCKET_EVENTS.USER_STATUS, userStatusHandler);
      socketService.off(SOCKET_EVENTS.GROUP_CREATED, groupCreatedHandler);
      socketService.off(SOCKET_EVENTS.GROUP_ADDED, groupAddedHandler);
      console.log("Successfully cleaned up all socket listeners");
    } catch (error) {
      console.error("Error cleaning up socket listeners:", error);
    }
  };

  const joinAllConversations = (conversations = []) => {
    if (!Array.isArray(conversations)) {
      console.warn("Invalid conversations data:", conversations);
      return;
    }

    conversations.forEach((conversation) => {
      if (!conversation) return;
      
      const conversationId = conversation?._id || conversation?.id || conversation?.conversationId;
      if (conversationId) {
        try {
          const success = socketService.emit("join_conversation", conversationId);
          if (success) {
            console.log("Joined conversation:", conversationId);
          } else {
            console.warn("Failed to join conversation:", conversationId);
          }
        } catch (error) {
          console.error("Error joining conversation:", conversationId, error);
        }
      } else {
        console.warn("Invalid conversation ID:", conversation);
      }
    });
  };
  
  useEffect(() => {
    const loadUserAndConversations = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.log("No auth token found, redirecting to login");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
          return;
        }

        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          console.log("User loaded successfully:", user.userId);
          await initializeSocket();
          const data = await fetchConversations();
          if (data && Array.isArray(data)) {
            joinAllConversations(data);
          }
        } else {
          console.log("User data not found, redirecting to login");
          await AsyncStorage.removeItem("authToken");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      } catch (err) {
        console.error("Error loading user and conversations:", err);
        if (err.response && err.response.status === 401) {
          console.log("Authentication error, redirecting to login");
          await AsyncStorage.removeItem("authToken");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        } else {
          setError("Failed to load conversations");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserAndConversations();

    return () => {
      cleanupSocketListeners();
      if (socketService.isConnected) {
        socketService.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const params = navigation.getState().routes.find((r) => r.name === "MessageScreen")?.params
      if (params?.refreshConversations) {
        console.log("Refreshing conversations after group creation")
        fetchConversations()
        if (params.newGroupId) {
          console.log("New group created with ID:", params.newGroupId)
          navigation.setParams({ refreshConversations: undefined, newGroupId: undefined })
        }
      }
    })
    return unsubscribe
  }, [navigation])
  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No auth token found when fetching conversations");
        setError("Authentication required");
        return null;
      }

      console.log("Fetching conversations...");
      const data = await messageService.getConversations();
      if (!data || !Array.isArray(data)) {
        console.warn("Invalid conversations data received:", data);
        return null;
      }

      console.log(`Received ${data.length} conversations`);
      const processedConversations = await Promise.all(
        data.map(async (conversation) => {
          if (!conversation) return null;
          
          if (conversation.isGroup) {
            try {
              const groupDetails = await messageService.getGroupByConversationId(
                conversation.conversationId || conversation._id
              );
              return {
                ...conversation,
                groupName: groupDetails?.name || "Nhóm chat",
                groupDescription: groupDetails?.description || "",
                groupAvatarUrl: groupDetails?.avatarUrl,
                members: groupDetails?.members || [],
              };
            } catch (err) {
              console.error("Error fetching group details:", err);
              return {
                ...conversation,
                groupName: conversation.groupName || "Nhóm chat",
                members: conversation.members || [],
              };
            }
          }
          return conversation;
        })
      );

      const validConversations = processedConversations.filter(Boolean);
      setConversations(validConversations);
      setError(null);
      return validConversations;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (err.response && err.response.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }, 2000);
      } else {
        setError("Failed to load conversations");
      }
      return null;
    }
  }

  const handleConversationPress = async (conversation) => {
    if (conversation.unreadCount > 0) {
      try {
        if (conversation.lastMessage) {
          await messageService.markMessageAsRead(conversation.lastMessage.messageId)
        }
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
        return message.content
      case "text":
      default:
        const prefix = message.senderId === currentUser?.userId ? "Bạn: " : ""

        if (message.isRecalled) return "Tin nhắn đã bị thu hồi"
        if (message.isDeleted) return "Tin nhắn đã bị xóa"
        let content = message.content
        if (content && content.length > 30) {
          content = content.substring(0, 27) + "..."
        }

        return prefix + content
    }
  }

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item)}>
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          item.groupAvatarUrl ? (
            <Image source={{ uri: item.groupAvatarUrl }} style={styles.avatar} />
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
          )
        ) : (
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
          ref={flatListRef}
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
