"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native"
import { Ionicons, MaterialIcons, FontAwesome, Feather, AntDesign } from "@expo/vector-icons"
import { useRoute } from "@react-navigation/native"
import { groupService } from "../services/groupService"
import { useAuth } from "../context/AuthContext"
import socketService from "../services/socketService"
import { SOCKET_EVENTS } from "../config/constants"


const GroupInfoScreen = ({ navigation }) => {
  const [pinConversation, setPinConversation] = useState(false)
  const [hideConversation, setHideConversation] = useState(false)
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedNewAdmin, setSelectedNewAdmin] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [groupId, setGroupId] = useState(null)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState(null) 
  const { user } = useAuth();
  const route = useRoute()
  const { conversation: initialConversation } = route.params || {}
  



  useEffect(() => {
    if (initialConversation && initialConversation.id) {
      setConversation(initialConversation) 

      const fetchGroupId = async () => {
        try {
          const groupDetails = await groupService.getGroupByConversationId(initialConversation.id)
          setGroupId(groupDetails.group.groupId)
        } catch (error) {
          console.error("Error fetching group ID:", error)
          setError("Không thể tải thông tin nhóm. Vui lòng thử lại sau.")
        }
      }
      fetchGroupId()
    }
  }, [initialConversation])

  // useEffect(() => {
  //   if (!conversation || !conversation.id) return
  //   const groupUpdatedHandler = (data) => {
  //     if (data.groupId === groupId) {
  //       console.log("Group updated:", data)
  //       fetchGroupDetails()
  //     }
  //   }

  //   const memberRoleUpdatedHandler = (data) => {
  //     if (data.groupId === groupId) {
  //       console.log("Member role updated:", data)
  //       fetchGroupDetails()
  //     }
  //   }

  //   const memberRemovedHandler = (data) => {
  //     if (data.groupId === groupId) {
  //       console.log("Member removed:", data)
  //       if (data.userId === user?.userId) {
  //         Alert.alert("Thông báo", "Bạn đã bị xóa khỏi nhóm", [
  //           { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
  //         ])
  //       } else {
  //         fetchGroupDetails()
  //       }
  //     }
  //   }

  //   const groupDissolvedHandler = (data) => {
  //     if (data.groupId === groupId) {
  //       console.log("Group dissolved:", data)
  //       Alert.alert("Thông báo", "Nhóm đã bị giải tán", [
  //         { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
  //       ])
  //     }
  //   }

  //   // Register event listeners
  //   const unsubscribeGroupUpdated = addListener("group_updated", groupUpdatedHandler)
  //   const unsubscribeMemberRoleUpdated = addListener("member_role_updated", memberRoleUpdatedHandler)
  //   const unsubscribeMemberRemoved = addListener("member_removed", memberRemovedHandler)
  //   const unsubscribeGroupDissolved = addListener("group_dissolved", groupDissolvedHandler)

  //   // Clean up listeners on unmount
  //   return () => {
  //     unsubscribeGroupUpdated()
  //     unsubscribeMemberRoleUpdated()
  //     unsubscribeMemberRemoved()
  //     unsubscribeGroupDissolved()
  //   }
  // }, [groupId, user, addListener, navigation, conversation])

  useEffect(() => {

    if (conversation && conversation.members && user) {
      const currentUserMember = conversation.members.find((member) => member.userId === user.userId)

      console.log("Current user:", user.userId)
      console.log("Group members:", conversation.members)
      console.log("Current user member data:", currentUserMember)

      const isAdmin = currentUserMember && (currentUserMember.role === "admin" || currentUserMember.isAdmin === true)

      console.log("Is user admin?", isAdmin)
      setIsCurrentUserAdmin(isAdmin)

      setFilteredMembers(conversation.members.filter((member) => member.userId !== user.userId))
    }
  }, [conversation, user])

  const handleLeaveGroup = async () => {
    if (isCurrentUserAdmin) {
      setShowLeaveModal(true)
    } else {
      confirmLeaveGroup()
    }
  }

  const confirmLeaveGroup = async (newAdminId = null) => {
    try {
      setLoading(true)

      if (isCurrentUserAdmin && !newAdminId) {
        Alert.alert("Lỗi", "Bạn phải chọn trưởng nhóm mới trước khi rời nhóm")
        setLoading(false)
        return
      }

      const groupDetails = await groupService.getGroupByConversationId(conversation.id)
      const groupId = groupDetails.group.groupId

      if (!groupId) {
        throw new Error("Không tìm thấy thông tin nhóm")
      }

      if (isCurrentUserAdmin && newAdminId) {
        await groupService.changeGroupMemberRole(groupId, newAdminId, "admin")
        socketService.emit(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, {
          groupId: groupId,
          conversationId: conversation.id,
          members: [newAdminId],
        });
      }

      await groupService.leaveGroup(groupId)
      socketService.emit(SOCKET_EVENTS.MEMBER_LEFT, {
        conversationId: conversation.id,
        groupId: groupId,
      })

      Alert.alert("Thành công", "Bạn đã rời khỏi nhóm", [
        { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
      ])
    } catch (err) {
      console.error("Error leaving group:", err)
      Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
      setShowLeaveModal(false)
    }
  }

  // Update the handleDeleteGroup function to be more consistent with error handling
  const handleDeleteGroup = async () => {
    // Kiểm tra lại quyền admin trước khi thực hiện
    if (!isCurrentUserAdmin) {
      Alert.alert("Lỗi", "Chỉ trưởng nhóm mới có thể giải tán nhóm")
      return
    }

    Alert.alert("Giải tán nhóm", "Bạn có chắc chắn muốn giải tán nhóm này không? Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Giải tán",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)

            // Get the group ID from the conversation ID
            const groupDetails = await groupService.getGroupByConversationId(conversation.id)
            const groupId = groupDetails.group.groupId

            if (!groupId) {
              throw new Error("Không tìm thấy thông tin nhóm")
            }

            // Log thông tin trước khi gọi API
            console.log("Attempting to delete group:", groupId)

            const response = await groupService.deleteGroup(groupId)
            socketService.emit(SOCKET_EVENTS.GROUP_DISSOLVED, {
              groupId: groupId,
              conversationId: conversation.id,
            });
            console.log("Delete group response:", response)

            Alert.alert("Thành công", "Nhóm đã được giải tán", [
              { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
            ])
          } catch (err) {
            console.error("Error deleting group:", err)

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = "Không thể giải tán nhóm. Vui lòng thử lại sau."
            if (err.response && err.response.data && err.response.data.message) {
              errorMessage = err.response.data.message
            }

            Alert.alert("Lỗi", errorMessage)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleSelectNewAdmin = (member) => {
    setSelectedNewAdmin(member)
  }

  const handleSearchMembers = (text) => {
    setSearchQuery(text)
    if (text.trim() === "") {
      setFilteredMembers(conversation.members.filter((member) => member.userId !== user.userId))
    } else {
      const filtered = conversation.members.filter(
        (member) => member.userId !== user.userId && member.fullName.toLowerCase().includes(text.toLowerCase()),
      )
      setFilteredMembers(filtered)
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Tùy chọn</Text>
    </View>
  )

  const renderGroupProfile = () => (
    <View style={styles.groupProfileContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <MaterialIcons name="people" size={40} color="#555" />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.groupNameContainer}>
        <Text style={styles.groupName}>{conversation?.name || "Nhóm chat"}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-2" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search" size={24} color="white" />
          <Text style={styles.actionButtonText}>Tìm{"\n"}tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="person-add" size={24} color="white" />
          <Text style={styles.actionButtonText}>Thêm{"\n"}thành viên</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="wallpaper" size={24} color="white" />
          <Text style={styles.actionButtonText}>Đổi{"\n"}hình nền</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="notifications" size={24} color="white" />
          <Text style={styles.actionButtonText}>Tắt{"\n"}thông báo</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderGroupDescription = () => (
    <TouchableOpacity style={styles.groupDescriptionButton}>
      <Ionicons name="information-circle-outline" size={24} color="#888" />
      <Text style={styles.groupDescriptionText}>{conversation?.description || "Thêm mô tả nhóm"}</Text>
    </TouchableOpacity>
  )

  const renderSettingItem = ({ icon, title, subtitle, rightComponent, color, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        {icon}
        <View style={styles.settingItemTextContainer}>
          <Text style={[styles.settingItemTitle, color && { color }]}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  )

  const renderLeaveGroupModal = () => (
    <Modal
      visible={showLeaveModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLeaveModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.leaveModalContainer}>
          <View style={styles.leaveModalHeader}>
            <View style={styles.modalHeaderLine} />
            <Text style={styles.leaveModalTitle}>Chọn trưởng nhóm mới trước khi rời</Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearchMembers}
            />
          </View>

          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.memberItem} onPress={() => handleSelectNewAdmin(item)}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.memberName}>{item.fullName}</Text>
                    <Text style={styles.memberRole}>{item.role === "admin" ? "Phó nhóm" : "Thành viên"}</Text>
                  </View>
                </View>
                <View
                  style={[styles.radioButton, selectedNewAdmin?.userId === item.userId && styles.radioButtonSelected]}
                />
              </TouchableOpacity>
            )}
            style={styles.membersList}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLeaveModal(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, !selectedNewAdmin && styles.confirmButtonDisabled]}
              onPress={() => confirmLeaveGroup(selectedNewAdmin?.userId)}
              disabled={!selectedNewAdmin}
            >
              <Text style={styles.confirmButtonText}>Chọn và tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  // Add a function to fetch group details
  const fetchGroupDetails = async () => {
    if (!conversation || !conversation.id) return

    try {
      setLoading(true)
      const groupDetails = await groupService.getGroupByConversationId(conversation.id)
      setGroupId(groupDetails.group.groupId)

      // Update the conversation data with the new details
      setConversation({
        ...conversation,
        members: groupDetails.group.members,
        name: groupDetails.group.name,
        description: groupDetails.group.description,
        avatar: groupDetails.group.avatarUrl,
      })

      // Update the parent screen when navigating back
      navigation.setParams({
        updatedConversation: {
          ...conversation,
          members: groupDetails.group.members,
          name: groupDetails.group.name,
          description: groupDetails.group.description,
          avatar: groupDetails.group.avatarUrl,
        },
      })
    } catch (err) {
      console.error("Error fetching group details:", err)
      setError("Không thể tải thông tin nhóm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin nhóm</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      {renderHeader()}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0068FF" />
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {renderGroupProfile()}
        {renderGroupDescription()}

        {renderSettingItem({
          icon: <FontAwesome name="users" size={22} color="#888" />,
          title: "Xem thành viên",
          rightComponent: <Text style={styles.memberCount}>({conversation?.members?.length || 0})</Text>,
          onPress: () => navigation.navigate("GroupMembersScreen", { conversation }),
        })}

        {renderSettingItem({
          icon: <MaterialIcons name="logout" size={24} color="#d63031" />,
          title: "Rời nhóm",
          color: "#d63031",
          onPress: handleLeaveGroup,
        })}

        {/* Add Delete Group option for admins */}
        {isCurrentUserAdmin &&
          renderSettingItem({
            icon: <AntDesign name="delete" size={24} color="#d63031" />,
            title: "Giải tán nhóm",
            color: "#d63031",
            onPress: handleDeleteGroup,
          })}
      </ScrollView>

      {renderLeaveGroupModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
  statusBar: {
    height: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#121212",
  },
  statusBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusBarText: {
    color: "white",
    fontSize: 12,
  },
  statusBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  signalContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 16,
    gap: 1,
  },
  signalBar: {
    width: 3,
    height: 6,
    backgroundColor: "#555",
    borderRadius: 1,
  },
  signalBarActive: {
    backgroundColor: "white",
    height: 10,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    color: "white",
    fontSize: 10,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  groupProfileContainer: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#444",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  groupName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  groupDescriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  groupDescriptionText: {
    color: "#888",
    fontSize: 16,
    marginLeft: 16,
  },
  mediaSectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  mediaSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mediaSectionTitle: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
  mediaScroll: {
    flexDirection: "row",
  },
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  mediaItemContent: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  seeMoreButton: {
    width: 40,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemTextContainer: {
    marginLeft: 16,
  },
  settingItemTitle: {
    color: "white",
    fontSize: 16,
  },
  settingItemSubtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  memberCount: {
    color: "#888",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  leaveModalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: "80%",
  },
  leaveModalHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalHeaderLine: {
    width: 36,
    height: 5,
    backgroundColor: "#555",
    borderRadius: 3,
    marginBottom: 10,
  },
  leaveModalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
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
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInitial: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberName: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  memberRole: {
    color: "#888",
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#888",
  },
  radioButtonSelected: {
    borderColor: "#0068FF",
    backgroundColor: "#0068FF",
  },
  modalButtons: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#0068FF",
    fontSize: 16,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#0068FF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#333",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default GroupInfoScreen
