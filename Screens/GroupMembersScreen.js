"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
// Add the import for groupService at the top of the file
import { groupService } from "../services/groupService"

const GroupMembersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("all")
  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState("member") // Default to member
  const [pendingMembers, setPendingMembers] = useState([])
  // Add a new state variable for groupId
  const [groupId, setGroupId] = useState(null)

  const route = useRoute()
  const { conversation } = route.params || {}
  const { user } = useAuth()

  useEffect(() => {
    // Use the members data directly from the conversation object
    if (conversation && conversation.members) {
      setMembers(conversation.members)
      setFilteredMembers(conversation.members)

      // Determine user role
      if (user) {
        const currentUserMember = conversation.members.find((member) => member.userId === user.userId)
        if (currentUserMember) {
          setUserRole(currentUserMember.role || "member")
        }
      }

      // For demo purposes, add some pending members
      setPendingMembers([
        {
          userId: "pending1",
          fullName: "Người dùng đang chờ 1",
          avatarUrl: null,
          requestedAt: new Date().toISOString(),
        },
        {
          userId: "pending2",
          fullName: "Người dùng đang chờ 2",
          avatarUrl: null,
          requestedAt: new Date().toISOString(),
        },
      ])
    }
  }, [conversation, user])

  // Add a new useEffect to fetch the group details when the component mounts
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (conversation && conversation.id) {
        try {
          setLoading(true)
          const groupDetails = await groupService.getGroupByConversationId(conversation.id)
          setGroupId(groupDetails.group.groupId)
        } catch (err) {
          console.error("Error fetching group details:", err)
          setError("Không thể tải thông tin nhóm. Vui lòng thử lại sau.")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchGroupDetails()
  }, [conversation])

  const handleSearch = (text) => {
    setSearchQuery(text)
    if (text.trim() === "") {
      setFilteredMembers(members)
    } else {
      const filtered = members.filter((member) => member.fullName.toLowerCase().includes(text.toLowerCase()))
      setFilteredMembers(filtered)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)

    switch (tab) {
      case "all":
        setFilteredMembers(members)
        break
      case "admins":
        setFilteredMembers(members.filter((member) => member.role === "admin" || member.role === "moderator"))
        break
      case "invited":
        // In a real app, you would filter for invited members
        setFilteredMembers([])
        break
      case "blocked":
        // In a real app, you would filter for blocked members
        setFilteredMembers([])
        break
      default:
        setFilteredMembers(members)
    }
  }

  const handleAddMember = () => {
    // Navigate to add member screen
    Alert.alert("Thêm thành viên", "Chức năng đang được phát triển")
  }

  // Update the handleMemberOptions function to use the state variable groupId instead of conversation.id
  const handleMemberOptions = (member) => {
    // Only admins and moderators can manage members
    if (userRole !== "admin" && userRole !== "moderator") return

    // Check if groupId is available
    if (!groupId) {
      Alert.alert("Lỗi", "Không thể tải thông tin nhóm. Vui lòng thử lại sau.")
      return
    }

    // Prepare options based on user role and selected member role
    const buttons = []

    // Admin can do everything
    if (userRole === "admin") {
      // Can't remove yourself as admin
      if (member.userId !== user.userId) {
        // Promote/demote options
        if (member.role === "moderator") {
          buttons.push({
            text: "Xóa vai trò phó nhóm",
            onPress: () => handleChangeMemberRole(groupId, member, "member"),
          })
        } else if (member.role === "member") {
          buttons.push({
            text: "Đặt làm phó nhóm",
            onPress: () => handleChangeMemberRole(groupId, member, "moderator"),
          })
        }

        // Remove option
        buttons.push({
          text: "Xóa khỏi nhóm",
          style: "destructive",
          onPress: () => handleRemoveMember(groupId, member),
        })
      }
    }
    // Moderator can only manage regular members
    else if (userRole === "moderator") {
      // Can't modify admins or other moderators
      if (member.role !== "admin" && member.role !== "moderator") {
        buttons.push({
          text: "Xóa khỏi nhóm",
          style: "destructive",
          onPress: () => handleRemoveMember(groupId, member),
        })
      }
    }

    // Add cancel button
    buttons.push({
      text: "Hủy",
      style: "cancel",
    })

    // Only show the menu if there are actions available
    if (buttons.length > 1) {
      Alert.alert(member.fullName, "Chọn hành động", buttons, { cancelable: true })
    }
  }

  // Update the handleChangeMemberRole function to use the API
  const handleChangeMemberRole = async (groupId, member, newRole) => {
    try {
      setLoading(true)

      // Call the API to change the member's role
      await groupService.changeGroupMemberRole(groupId, member.userId, newRole)

      // Update local state
      setMembers((prevMembers) => prevMembers.map((m) => (m.userId === member.userId ? { ...m, role: newRole } : m)))
      setFilteredMembers((prevMembers) =>
        prevMembers.map((m) => (m.userId === member.userId ? { ...m, role: newRole } : m)),
      )

      // Show success message
      const actionText = newRole === "moderator" ? "đặt làm phó nhóm" : "xóa vai trò phó nhóm"
      Alert.alert("Thành công", `Đã ${actionText} cho ${member.fullName}`)
    } catch (err) {
      console.error("Error changing member role:", err)
      Alert.alert("Lỗi", "Không thể thay đổi vai trò thành viên. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Update the handleRemoveMember function to use the API
  const handleRemoveMember = async (groupId, member) => {
    try {
      // Confirm before removing
      Alert.alert("Xóa thành viên", `Bạn có chắc chắn muốn xóa ${member.fullName} khỏi nhóm không?`, [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)

              // Call the API to remove the member
              await groupService.removeGroupMember(groupId, member.userId)

              // Update local state
              setMembers((prevMembers) => prevMembers.filter((m) => m.userId !== member.userId))
              setFilteredMembers((prevMembers) => prevMembers.filter((m) => m.userId !== member.userId))

              Alert.alert("Thành công", `Đã xóa ${member.fullName} khỏi nhóm`)
            } catch (err) {
              console.error("Error removing member:", err)
              Alert.alert("Lỗi", "Không thể xóa thành viên. Vui lòng thử lại sau.")
            } finally {
              setLoading(false)
            }
          },
        },
      ])
    } catch (err) {
      console.error("Error in remove member flow:", err)
    }
  }

  const handleApproveMember = async (member) => {
    // In a real app, you would call an API to approve the member
    Alert.alert("Duyệt thành viên", "Chức năng đang được phát triển")
  }

  // Update the renderAdminView function to show different UI based on member role
  const renderAdminView = () => {
    return (
      <>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => handleTabChange("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "admins" && styles.activeTab]}
            onPress={() => handleTabChange("admins")}
          >
            <Text style={[styles.tabText, activeTab === "admins" && styles.activeTabText]}>Trưởng và phó nhóm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "invited" && styles.activeTab]}
            onPress={() => handleTabChange("invited")}
          >
            <Text style={[styles.tabText, activeTab === "invited" && styles.activeTabText]}>Đã mời</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "blocked" && styles.activeTab]}
            onPress={() => handleTabChange("blocked")}
          >
            <Text style={[styles.tabText, activeTab === "blocked" && styles.activeTabText]}>Đã chặn</Text>
          </TouchableOpacity>
        </View>

        {pendingMembers.length > 0 && (
          <TouchableOpacity style={styles.pendingMembersSection}>
            <View style={styles.pendingIconContainer}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.pendingMembersText}>Duyệt thành viên ({pendingMembers.length})</Text>
            <View style={styles.pendingCountBadge}>
              <Text style={styles.pendingCountText}>{pendingMembers.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.memberCountContainer}>
          <Text style={styles.memberCountText}>Thành viên ({filteredMembers.length})</Text>
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => handleMemberOptions(item)}
              disabled={
                // Disable if current user is moderator and selected member is admin or moderator
                (userRole === "moderator" && (item.role === "admin" || item.role === "moderator")) ||
                // Disable if current user is admin and selected member is admin (self)
                (userRole === "admin" && item.role === "admin" && item.userId === user.userId)
              }
            >
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={[styles.memberAvatar, { backgroundColor: "#0068FF" }]}>
                  <Text style={styles.memberInitial}>
                    {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {item.fullName}
                  {item.userId === user.userId ? " (Bạn)" : ""}
                </Text>
                <Text style={styles.memberRole}>
                  {item.role === "admin"
                    ? "Trưởng nhóm"
                    : item.role === "moderator"
                      ? "Phó nhóm"
                      : item.addedBy
                        ? `Thêm bởi ${item.addedBy}`
                        : "Thành viên"}
                </Text>
              </View>

              {item.role === "admin" && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
                </View>
              )}

              {item.role === "moderator" && (
                <View style={styles.moderatorBadge}>
                  <Ionicons name="shield-outline" size={16} color="#0068FF" />
                </View>
              )}

              {/* Show action indicator if the member can be managed */}
              {((userRole === "admin" && item.userId !== user.userId) ||
                (userRole === "moderator" && item.role !== "admin" && item.role !== "moderator")) && (
                <Ionicons name="chevron-forward" size={20} color="#888888" style={styles.actionIndicator} />
              )}
            </TouchableOpacity>
          )}
        />
      </>
    )
  }

  const renderMemberView = () => {
    return (
      <>
        <View style={styles.memberTabsContainer}>
          <TouchableOpacity
            style={[styles.memberTab, activeTab === "all" && styles.activeMemberTab]}
            onPress={() => handleTabChange("all")}
          >
            <Text style={[styles.memberTabText, activeTab === "all" && styles.activeMemberTabText]}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.memberTab, activeTab === "invited" && styles.activeMemberTab]}
            onPress={() => handleTabChange("invited")}
          >
            <Text style={[styles.memberTabText, activeTab === "invited" && styles.activeMemberTabText]}>Đã mời</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.memberCountContainer}>
          <Text style={styles.memberCountText}>Thành viên ({filteredMembers.length})</Text>
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={[styles.memberAvatar, { backgroundColor: "#0068FF" }]}>
                  <Text style={styles.memberInitial}>
                    {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.fullName}</Text>
                <Text style={styles.memberRole}>
                  {item.role === "admin"
                    ? "Trưởng nhóm"
                    : item.role === "moderator"
                      ? "Phó nhóm"
                      : item.addedBy
                        ? `Thêm bởi ${item.addedBy}`
                        : "Thành viên"}
                </Text>
              </View>

              {item.userId !== user?.userId && (
                <TouchableOpacity style={styles.addFriendButton}>
                  <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </>
    )
  }

  if (loading) {
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

  const screenTitle = userRole === "admin" || userRole === "moderator" ? "Quản lý thành viên" : "Thành viên"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{screenTitle}</Text>

        <View style={styles.headerRightContainer}>
          {(userRole === "admin" || userRole === "moderator") && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thành viên"
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

      {userRole === "admin" || userRole === "moderator" ? renderAdminView() : renderMemberView()}
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
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    marginRight: 16,
  },
  searchButton: {
    padding: 4,
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
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
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
  memberTabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  memberTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeMemberTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  memberTabText: {
    color: "#888888",
    fontSize: 14,
  },
  activeMemberTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pendingMembersSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  pendingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pendingMembersText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  pendingCountBadge: {
    backgroundColor: "#FF3B30",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  memberCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberCountText: {
    color: "#0068FF",
    fontSize: 16,
  },
  optionsButton: {
    padding: 4,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInitial: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  memberRole: {
    color: "#888888",
    fontSize: 14,
  },
  adminBadge: {
    marginLeft: 8,
  },
  moderatorBadge: {
    marginLeft: 8,
  },
  addFriendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0068FF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIndicator: {
    marginLeft: 8,
  },
  actionMenu: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    overflow: "hidden",
    width: 250,
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  actionMenuItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 12,
  },
  actionMenuItemDestructive: {
    color: "#FF3B30",
  },
})

export default GroupMembersScreen
