"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { friendService } from "../services/friendService"
import { messageService } from "../services/messageService"

const { width, height } = Dimensions.get("window")

// ForwardScreen component for message forwarding
const ForwardScreen = ({ visible, onClose, onSelectContact, messageToForward }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [selectedConversationIds, setSelectedConversationIds] = useState([]) // Track selected conversation IDs
  const [groups, setGroups] = useState([
    {
      id: "group1",
      name: "Nhóm 12_CNM",
      avatar: null,
      isGroup: true,
      memberCount: 5,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group2",
      name: "DHTH17F",
      avatar: require("../assets/icon.png"),
      isGroup: true,
    },
    {
      id: "group3",
      name: "CN_DHKTPM17C",
      avatar: null,
      isGroup: true,
      memberCount: 70,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group4",
      name: "nhóm.học triết 5F🦄",
      avatar: null,
      isGroup: true,
      memberCount: 10,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
    {
      id: "group5",
      name: "Nhóm GDTC ca 2 lớp DHTH17B IUH",
      avatar: null,
      isGroup: true,
      memberCount: 30,
      members: [
        { id: "m1", avatar: require("../assets/icon.png") },
        { id: "m2", avatar: require("../assets/icon.png") },
        { id: "m3", avatar: require("../assets/icon.png") },
      ],
    },
  ])

  // State for friends data
  const [friendsData, setFriendsData] = useState({})
  const [sortedLetters, setSortedLetters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false) // Track sending state

  // Fetch friends data when the component becomes visible
  useEffect(() => {
    if (visible) {
      fetchFriends()
    }
  }, [visible])

  // Function to fetch friends from friendService
  const fetchFriends = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get friends from the friendService
      const friends = await friendService.getFriends()

      // Process friends data into alphabetical sections
      const groupedFriends = processFriendsData(friends)
      setFriendsData(groupedFriends)

      // Sort letters alphabetically
      const letters = Object.keys(groupedFriends).sort()
      setSortedLetters(letters)
    } catch (err) {
      console.error("Error fetching friends for forward screen:", err)
      setError("Không thể tải danh sách bạn bè")
    } finally {
      setLoading(false)
    }
  }

  // Process friends data into alphabetical sections
  const processFriendsData = (friends) => {
    if (!friends || !Array.isArray(friends)) return {}

    // Group friends by first letter of name
    const sections = {}

    friends.forEach((friend) => {
      const firstLetter = friend.fullName.charAt(0).toUpperCase()

      if (!sections[firstLetter]) {
        sections[firstLetter] = []
      }

      sections[firstLetter].push({
        id: friend.userId,
        name: friend.fullName,
        avatar: friend.avatarUrl ? { uri: friend.avatarUrl } : null,
        letter: firstLetter,
        conversationId: friend.conversationId, // Store conversation ID if available
      })
    })

    return sections
  }

  const toggleSelectContact = (contact) => {
    // Check if contact is already selected
    if (selectedContacts.some((c) => c.id === contact.id)) {
      // Remove from selected contacts
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id))

      // Remove conversation ID if it exists
      if (contact.conversationId) {
        setSelectedConversationIds(selectedConversationIds.filter((id) => id !== contact.conversationId))
      }
    } else {
      // Add to selected contacts
      setSelectedContacts([...selectedContacts, contact])

      // Add conversation ID if it exists
      if (contact.conversationId) {
        setSelectedConversationIds([...selectedConversationIds, contact.conversationId])
      }
    }
  }

  const handleSend = async () => {
    if (selectedContacts.length === 0 || !messageToForward) return

    try {
      setIsSending(true)

      // Create an array to track successful forwards
      const successfulForwards = []
      const failedForwards = []

      // Forward the message to each selected conversation
      for (const contact of selectedContacts) {
        try {
          // First, get or create a conversation with this contact if needed
          let conversationId = contact.conversationId

          if (!conversationId) {
            // If no conversation ID exists, create one
            const conversation = await messageService.getOrStartConversation(contact.id)
            conversationId = conversation.conversationId
          }

          // Forward the message to this conversation
          await messageService.forwardMessage(messageToForward.messageId, conversationId)

          // Add to successful forwards
          successfulForwards.push(contact.name)
        } catch (err) {
          console.error(`Failed to forward message to ${contact.name}:`, err)
          failedForwards.push(contact.name)
        }
      }

      // Show success message
      if (successfulForwards.length > 0) {
        const message =
          successfulForwards.length === 1
            ? `Đã chuyển tiếp tin nhắn đến ${successfulForwards[0]}`
            : `Đã chuyển tiếp tin nhắn đến ${successfulForwards.length} người`

        Alert.alert("Thành công", message)
      }

      // Show error message if any forwards failed
      if (failedForwards.length > 0) {
        const message =
          failedForwards.length === 1
            ? `Không thể chuyển tiếp tin nhắn đến ${failedForwards[0]}`
            : `Không thể chuyển tiếp tin nhắn đến ${failedForwards.length} người`

        Alert.alert("Lỗi", message)
      }

      // Close the forward screen
      onClose()
    } catch (err) {
      console.error("Error forwarding messages:", err)
      Alert.alert("Lỗi", "Không thể chuyển tiếp tin nhắn. Vui lòng thử lại.")
    } finally {
      setIsSending(false)
    }
  }

  // Filter friends and groups based on search query
  const filterItems = (items, query) => {
    if (!query) return items

    const lowercaseQuery = query.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(lowercaseQuery))
  }

  // Get the message content to display
  const getMessageContent = () => {
    if (!messageToForward) return ""

    if (
      messageToForward.type === "image" ||
      (messageToForward.attachments &&
        messageToForward.attachments.length > 0 &&
        messageToForward.attachments[0].type.startsWith("image/"))
    ) {
      return "[Hình ảnh]"
    } else if (
      messageToForward.type === "file" ||
      (messageToForward.attachments &&
        messageToForward.attachments.length > 0 &&
        !messageToForward.attachments[0].type.startsWith("image/"))
    ) {
      return "[File]"
    } else {
      return messageToForward.content || ""
    }
  }

  if (!visible) return null

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.forwardContainer}>
        <View style={styles.forwardHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.forwardHeaderTitle}>
            <Text style={styles.forwardTitle}>Chia sẻ</Text>
            <Text style={styles.forwardSubtitle}>Đã chọn: {selectedContacts.length}</Text>
          </View>
        </View>

        <View style={styles.forwardSearchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.forwardSearchIcon} />
          <TextInput
            style={styles.forwardSearchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.forwardLoadingContainer}>
            <ActivityIndicator size="large" color="#0068FF" />
          </View>
        ) : (
          <ScrollView style={styles.forwardScrollView}>
            {/* Groups Section */}
            <View style={styles.forwardSectionContainer}>
              <Text style={styles.forwardSectionTitle}>Nhóm trò chuyện</Text>

              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.forwardContactItem}
                  onPress={() => toggleSelectContact(group)}
                >
                  <View style={styles.groupAvatarContainer}>
                    {group.avatar ? (
                      <Image source={group.avatar} style={styles.forwardContactAvatar} />
                    ) : (
                      <View style={styles.groupAvatarsStack}>
                        {group.members &&
                          group.members
                            .slice(0, 3)
                            .map((member, index) => (
                              <Image
                                key={member.id}
                                source={member.avatar}
                                style={[
                                  styles.groupStackedAvatar,
                                  { top: index * 8, left: index * 8, zIndex: 3 - index },
                                ]}
                              />
                            ))}
                        {group.memberCount && (
                          <View style={styles.groupMemberCount}>
                            <Text style={styles.groupMemberCountText}>{group.memberCount}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  <Text style={styles.forwardContactName}>{group.name}</Text>

                  <View
                    style={[
                      styles.forwardCheckbox,
                      selectedContacts.some((c) => c.id === group.id) && styles.forwardCheckboxSelected,
                    ]}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.seeMoreButton}>
                <Text style={styles.seeMoreText}>Xem thêm</Text>
                <Ionicons name="chevron-forward" size={20} color="#0068FF" />
              </TouchableOpacity>
            </View>

            {/* Friends Section */}
            <View style={styles.forwardSectionContainer}>
              <Text style={styles.forwardSectionTitle}>Bạn bè</Text>

              {error ? (
                <View style={styles.forwardErrorContainer}>
                  <Text style={styles.forwardErrorText}>{error}</Text>
                  <TouchableOpacity style={styles.forwardRetryButton} onPress={fetchFriends}>
                    <Text style={styles.forwardRetryButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                sortedLetters.map((letter) => (
                  <View key={letter}>
                    <Text style={styles.alphabetHeader}>{letter}</Text>

                    {friendsData[letter].map((friend) => (
                      <TouchableOpacity
                        key={friend.id}
                        style={styles.forwardContactItem}
                        onPress={() => toggleSelectContact(friend)}
                      >
                        {friend.avatar ? (
                          <Image source={friend.avatar} style={styles.forwardContactAvatar} />
                        ) : (
                          <View style={[styles.forwardContactAvatar, { backgroundColor: "#FF3B30" }]}>
                            <Text style={styles.forwardContactInitial}>{friend.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        )}

                        <Text style={styles.forwardContactName}>{friend.name}</Text>

                        <View
                          style={[
                            styles.forwardCheckbox,
                            selectedContacts.some((c) => c.id === friend.id) && styles.forwardCheckboxSelected,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}

        <View style={styles.forwardFooter}>
          <View style={styles.forwardInputContainer}>
            <TextInput
              style={[styles.forwardMessageInput, { color: "#FFFFFF" }]}
              value={getMessageContent()}
              editable={false}
              multiline={true}
              numberOfLines={2}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.forwardSendButton,
              selectedContacts.length === 0 || isSending ? styles.forwardSendButtonDisabled : {},
            ]}
            onPress={handleSend}
            disabled={selectedContacts.length === 0 || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  forwardContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  forwardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  forwardHeaderTitle: {
    flex: 1,
    marginLeft: 16,
  },
  forwardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  forwardSubtitle: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  forwardSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  forwardSearchIcon: {
    marginRight: 8,
  },
  forwardSearchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
  },
  forwardScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  forwardSectionContainer: {
    marginBottom: 20,
  },
  forwardSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  forwardContactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  forwardContactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  forwardContactInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forwardContactName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  forwardCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8E8E93",
    backgroundColor: "transparent",
  },
  forwardCheckboxSelected: {
    backgroundColor: "#0068FF",
    borderColor: "#0068FF",
  },
  forwardFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  forwardInputContainer: {
    flex: 1,
    backgroundColor: "#262626",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  forwardMessageInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 60,
    textAlignVertical: "center",
  },
  forwardSendButton: {
    backgroundColor: "#0068FF",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  forwardSendButtonDisabled: {
    backgroundColor: "rgba(0, 104, 255, 0.5)",
  },
  alphabetHeader: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  groupAvatarContainer: {
    marginRight: 12,
  },
  groupAvatarsStack: {
    width: 40,
    height: 40,
    position: "relative",
  },
  groupStackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#121212",
  },
  groupMemberCount: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupMemberCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 10,
    color: "#0068FF",
  },
  seeMoreText: {
    color: "#0068FF",
    fontSize: 14,
    marginRight: 4,
  },
  forwardLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  forwardErrorContainer: {
    padding: 20,
    alignItems: "center",
  },
  forwardErrorText: {
    color: "#FF3B30",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  forwardRetryButton: {
    backgroundColor: "#0068FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  forwardRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default ForwardScreen
