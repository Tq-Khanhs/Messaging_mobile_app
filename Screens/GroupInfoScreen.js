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
  Image,
} from "react-native"
import { Ionicons, MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons"
import { useRoute } from "@react-navigation/native"
import { groupService } from "../services/groupService"
import { useAuth } from "../context/AuthContext"
import socketService from "../services/socketService"
import { SOCKET_EVENTS } from "../config/constants"
import { useSocket } from "../context/SocketContext"
import * as ImagePicker from "expo-image-picker"

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
  const { user } = useAuth()
  const { addListener, removeListener } = useSocket()
  const route = useRoute()
  const { conversation: initialConversation } = route.params || {}

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [avatarImage, setAvatarImage] = useState(null)
  const [showImagePickerOptions, setShowImagePickerOptions] = useState(false)

  
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

  useEffect(() => {
    if (!conversation || !conversation.id) return

    const groupUpdatedHandler = (data) => {
      if (data.groupId === groupId || data.conversationId === conversation.id) {
        console.log("Group updated:", data)
        fetchGroupDetails()
      }
    }

    const memberRoleUpdatedHandler = (data) => {
      if (data.groupId === groupId || data.conversationId === conversation.id) {
        console.log("Member role updated:", data)
        fetchGroupDetails()
      }
    }

    const memberRemovedHandler = (data) => {
      if (data.groupId === groupId || data.conversationId === conversation.id) {
        console.log("Member removed:", data)
        if (data.userId === user?.userId) {
          Alert.alert("Thông báo", "Bạn đã bị xóa khỏi nhóm", [
            { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
          ])
        } else {
          fetchGroupDetails()
        }
      }
    }

    const memberLeftHandler = (data) => {
      if (data.groupId === groupId || data.conversationId === conversation.id) {
        fetchGroupDetails()
      }
    }

    const groupDissolvedHandler = (data) => {
      if (data.groupId === groupId || data.conversationId === conversation.id) {
        console.log("Group dissolved:", data)
        Alert.alert("Thông báo", "Nhóm đã bị giải tán", [
          { text: "OK", onPress: () => navigation.navigate("MessagesScreen") },
        ])
      }
    }

    // Register event listeners
    addListener(SOCKET_EVENTS.GROUP_UPDATED, groupUpdatedHandler)
    addListener(SOCKET_EVENTS.GROUP_DISSOLVED, groupDissolvedHandler)
    addListener(SOCKET_EVENTS.GROUP_ADDED, memberLeftHandler)
    addListener(SOCKET_EVENTS.GROUP_REMOVED, memberLeftHandler)
    addListener(SOCKET_EVENTS.GROUP_AVATAR_UPDATED, memberLeftHandler)

    addListener(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, memberRoleUpdatedHandler)
    addListener(SOCKET_EVENTS.MEMBER_REMOVED, memberRemovedHandler)
    addListener(SOCKET_EVENTS.MEMBER_LEFT, memberLeftHandler)
    addListener(SOCKET_EVENTS.MEMBER_ADDED, memberLeftHandler)
    addListener(SOCKET_EVENTS.NEW_MESSAGE, memberLeftHandler)

    return () => {
      removeListener(SOCKET_EVENTS.GROUP_UPDATED, groupUpdatedHandler)
      removeListener(SOCKET_EVENTS.GROUP_DISSOLVED, groupDissolvedHandler)
      removeListener(SOCKET_EVENTS.GROUP_ADDED, memberLeftHandler)
      removeListener(SOCKET_EVENTS.GROUP_REMOVED, memberLeftHandler)
      removeListener(SOCKET_EVENTS.GROUP_AVATAR_UPDATED, memberLeftHandler)

      removeListener(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, memberRoleUpdatedHandler)
      removeListener(SOCKET_EVENTS.MEMBER_REMOVED, memberRemovedHandler)
      removeListener(SOCKET_EVENTS.MEMBER_LEFT, memberLeftHandler)
      removeListener(SOCKET_EVENTS.MEMBER_ADDED, memberLeftHandler)
      removeListener(SOCKET_EVENTS.NEW_MESSAGE, memberLeftHandler)
    }
  }, [groupId, user, conversation, useSocket])

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
        })
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
            const groupDetails = await groupService.getGroupByConversationId(conversation.id)
            const groupId = groupDetails.group.groupId

            if (!groupId) {
              throw new Error("Không tìm thấy thông tin nhóm")
            }

            console.log("Attempting to delete group:", groupId)

            const response = await groupService.deleteGroup(groupId)
            socketService.emit(SOCKET_EVENTS.GROUP_DISSOLVED, {
              groupId: groupId,
              conversationId: conversation.id,
            })
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

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !groupId) return

    try {
      setLoading(true)
      await groupService.updateGroup(groupId, { name: newGroupName.trim() })

      // Update local state
      setConversation({
        ...conversation,
        name: newGroupName.trim(),
      })

      // Emit socket event
      socketService.emit(SOCKET_EVENTS.GROUP_UPDATED, {
        groupId: groupId,
        conversationId: conversation.id,
        name: newGroupName.trim(),
      })

      setIsEditingName(false)
      Alert.alert("Thành công", "Đã cập nhật tên nhóm")
    } catch (err) {
      console.error("Error updating group name:", err)
      Alert.alert("Lỗi", "Không thể cập nhật tên nhóm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGroupDescription = async () => {
    if (!groupId) return

    try {
      setLoading(true)
      await groupService.updateGroup(groupId, { description: newGroupDescription.trim() })

      // Update local state
      setConversation({
        ...conversation,
        description: newGroupDescription.trim(),
      })

      // Emit socket event
      socketService.emit(SOCKET_EVENTS.GROUP_UPDATED, {
        groupId: groupId,
        conversationId: conversation.id,
        description: newGroupDescription.trim(),
      })

      setIsEditingDescription(false)
      Alert.alert("Thành công", "Đã cập nhật mô tả nhóm")
    } catch (err) {
      console.error("Error updating group description:", err)
      Alert.alert("Lỗi", "Không thể cập nhật mô tả nhóm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAvatar = () => {
    setShowImagePickerOptions(true)
  }

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập máy ảnh để tiếp tục.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Giảm chất lượng xuống để giảm kích thước file
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarImage(result.assets[0].uri)
        uploadGroupAvatar(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại sau.")
    } finally {
      setShowImagePickerOptions(false)
    }
  }

  const chooseFromLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Giảm chất lượng xuống để giảm kích thước file
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarImage(result.assets[0].uri)
        uploadGroupAvatar(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại sau.")
    } finally {
      setShowImagePickerOptions(false)
    }
  }

  const pickImage = () => {
    setShowImagePickerOptions(true)
  }

  const uploadGroupAvatar = async (imageUri) => {
    if (!imageUri || !groupId) {
      Alert.alert("Lỗi", "Thiếu thông tin cần thiết để cập nhật ảnh đại diện")
      return
    }

    try {
      setLoading(true)
      console.log(`Uploading avatar for group ID: ${groupId}`)
      console.log(`Image URI: ${imageUri}`)

      // Trực tiếp gọi service với imageUri
      const response = await groupService.uploadGroupAvatar(groupId, imageUri)
      console.log("Upload response:", response)

      if (response && response.avatarUrl) {
        // Cập nhật state với URL avatar mới
        setConversation({
          ...conversation,
          avatar: response.avatarUrl,
        })

        // Thông báo cho các thành viên khác về việc cập nhật avatar
        socketService.emit(SOCKET_EVENTS.GROUP_AVATAR_UPDATED, {
          groupId: groupId,
          conversationId: conversation.id,
          avatarUrl: response.avatarUrl,
        })

        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện nhóm")
      } else {
        throw new Error("Không nhận được URL avatar từ server")
      }
    } catch (err) {
      console.error("Error uploading group avatar:", err)

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau."

      if (err.response) {
        console.log("Error response status:", err.response.status)
        console.log("Error response data:", err.response.data)

        if (err.response.status === 500) {
          errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message
        }
      } else if (err.request) {
        console.log("No response received:", err.request)
        errorMessage = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
      } else if (err.message) {
        errorMessage = err.message
      }

      Alert.alert("Lỗi", errorMessage)
    } finally {
      setLoading(false)
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
        <TouchableOpacity
          style={styles.avatar}
          onPress={isCurrentUserAdmin ? handleChangeAvatar : null}
          disabled={!isCurrentUserAdmin}
        >
          {conversation?.avatar ? (
            <Image source={{ uri: conversation.avatar }} style={{ width: 120, height: 120, borderRadius: 60 }} />
          ) : (
            <MaterialIcons name="people" size={40} color="#555" />
          )}
          {isCurrentUserAdmin && (
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.groupNameContainer}>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.editNameInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Nhập tên nhóm"
              placeholderTextColor="#888"
              autoFocus
            />
            <View style={styles.editNameButtons}>
              <TouchableOpacity style={styles.editNameButton} onPress={() => setIsEditingName(false)}>
                <Text style={styles.editNameButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editNameButton, styles.saveButton]} onPress={handleUpdateGroupName}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.groupName}>{conversation?.name || "Nhóm chat"}</Text>
            {isCurrentUserAdmin && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewGroupName(conversation?.name || "")
                  setIsEditingName(true)
                }}
              >
                <Feather name="edit-2" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </>
        )}
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
          <Ionicons name="notifications" size={24} color="white" />
          <Text style={styles.actionButtonText}>Tắt{"\n"}thông báo</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderGroupDescription = () => (
    <View style={styles.groupDescriptionContainer}>
      {isEditingDescription ? (
        <View style={styles.editDescriptionContainer}>
          <TextInput
            style={styles.editDescriptionInput}
            value={newGroupDescription}
            onChangeText={setNewGroupDescription}
            placeholder="Nhập mô tả nhóm"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            autoFocus
          />
          <View style={styles.editDescriptionButtons}>
            <TouchableOpacity style={styles.editDescriptionButton} onPress={() => setIsEditingDescription(false)}>
              <Text style={styles.editDescriptionButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editDescriptionButton, styles.saveButton]}
              onPress={handleUpdateGroupDescription}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.groupDescriptionButton}
          onPress={
            isCurrentUserAdmin
              ? () => {
                  setNewGroupDescription(conversation?.description || "")
                  setIsEditingDescription(true)
                }
              : null
          }
          disabled={!isCurrentUserAdmin}
        >
          <Ionicons name="information-circle-outline" size={24} color="#888" />
          <Text style={styles.groupDescriptionText}>{conversation?.description || "Thêm mô tả nhóm"}</Text>
          {isCurrentUserAdmin && <Feather name="edit-2" size={18} color="#888" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      )}
    </View>
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

  const renderImagePickerModal = () => (
    <Modal
      visible={showImagePickerOptions}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowImagePickerOptions(false)}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImagePickerOptions(false)}>
        <View style={styles.imagePickerContainer}>
          <View style={styles.imagePickerHeader}>
            <View style={styles.modalHeaderLine} />
            <Text style={styles.imagePickerTitle}>Chọn ảnh</Text>
          </View>

          <TouchableOpacity style={styles.imagePickerOption} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#0068FF" />
            <Text style={styles.imagePickerOptionText}>Chụp ảnh mới</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imagePickerOption} onPress={chooseFromLibrary}>
            <Ionicons name="images" size={24} color="#0068FF" />
            <Text style={styles.imagePickerOptionText}>Chọn từ thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelPickerButton} onPress={() => setShowImagePickerOptions(false)}>
            <Text style={styles.cancelPickerButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

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
            icon: <MaterialIcons name="delete" size={24} color="#d63031" />,
            title: "Giải tán nhóm",
            color: "#d63031",
            onPress: handleDeleteGroup,
          })}
      </ScrollView>

      {renderLeaveGroupModal()}
      {renderImagePickerModal()}
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
    backgroundColor: "#0068FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
    zIndex: 10,
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
  editNameContainer: {
    width: "100%",
    alignItems: "center",
  },
  editNameInput: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#0068FF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: "80%",
    textAlign: "center",
  },
  editNameButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  editNameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#0068FF",
  },
  editNameButtonText: {
    color: "#0068FF",
    fontSize: 14,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
  },
  groupDescriptionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  editDescriptionContainer: {
    padding: 16,
  },
  editDescriptionInput: {
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 80,
  },
  editDescriptionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  editDescriptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 10,
  },
  editDescriptionButtonText: {
    color: "#0068FF",
    fontSize: 14,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0068FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  imagePickerContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  imagePickerHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  imagePickerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  imagePickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  imagePickerOptionText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
  cancelPickerButton: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelPickerButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default GroupInfoScreen
