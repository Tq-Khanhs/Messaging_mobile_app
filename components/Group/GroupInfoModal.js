"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, FlatList } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const GroupInfoModal = ({ group, visible, onClose, navigation, onSearchMessages }) => {
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false)

  // Sample group members
  const members = [
    {
      id: "user1",
      name: "Tấn Tài",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isAdmin: true,
      lastActive: "1 giờ trước",
    },
    {
      id: "user2",
      name: "Nguyễn Thành Nhân",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      isAdmin: false,
      lastActive: "2 giờ trước",
    },
    {
      id: "currentUser",
      name: "Tôi",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      isAdmin: false,
      lastActive: "Đang hoạt động",
    },
    {
      id: "user3",
      name: "Hoàng Kiệt",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      isAdmin: false,
      lastActive: "3 giờ trước",
    },
    {
      id: "user4",
      name: "Trung Nguyễn",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      isAdmin: false,
      lastActive: "1 ngày trước",
    },
  ]

  // Sample shared media
  const sharedMedia = [
    { id: 1, type: "image", url: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, type: "image", url: "https://randomuser.me/api/portraits/men/2.jpg" },
    { id: 3, type: "image", url: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, type: "image", url: "https://randomuser.me/api/portraits/men/4.jpg" },
    { id: 5, type: "image", url: "https://randomuser.me/api/portraits/men/5.jpg" },
  ]

  const renderMemberItem = ({ item }) => (
    <TouchableOpacity style={styles.memberItem}>
      <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameContainer}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.isAdmin && <Text style={styles.adminBadge}>Quản trị viên</Text>}
        </View>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
      <TouchableOpacity style={styles.memberActionButton}>
        <Icon name="more-vert" size={24} color="#888888" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderSharedMediaItem = ({ item }) => <Image source={{ uri: item.url }} style={styles.sharedMediaItem} />

  const menuItems = [
    {
      id: "search",
      icon: "search",
      title: "Tìm tin nhắn",
      onPress: onSearchMessages,
    },
    {
      id: "add_members",
      icon: "person-add",
      title: "Thêm thành viên",
      onPress: () => console.log("Add members"),
    },
    {
      id: "change_background",
      icon: "wallpaper",
      title: "Đổi hình nền",
      onPress: () => console.log("Change background"),
    },
    {
      id: "group_description",
      icon: "info",
      title: "Thêm mô tả nhóm",
      onPress: () => console.log("Add group description"),
    },
    {
      id: "media_files",
      icon: "photo-library",
      title: "Ảnh, file, link",
      onPress: () => console.log("Media files"),
      hasContent: true,
    },
    {
      id: "group_calendar",
      icon: "event",
      title: "Lịch nhóm",
      onPress: () => console.log("Group calendar"),
    },
    {
      id: "pinned_messages",
      icon: "push-pin",
      title: "Tin nhắn đã ghim",
      onPress: () => console.log("Pinned messages"),
    },
    {
      id: "polls",
      icon: "poll",
      title: "Bình chọn",
      onPress: () => console.log("Polls"),
    },
    {
      id: "group_settings",
      icon: "settings",
      title: "Cài đặt nhóm",
      onPress: () => console.log("Group settings"),
    },
  ]

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tùy chọn</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Group Avatar and Name */}
          <View style={styles.groupInfoSection}>
            <View style={styles.groupAvatarContainer}>
              {group.avatar ? (
                <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
              ) : (
                <View style={styles.groupAvatarPlaceholder}>
                  <Icon name="people" size={40} color="#AAAAAA" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Icon name="camera-alt" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.groupNameContainer}>
              <Text style={styles.groupName}>{group.name}</Text>
              <TouchableOpacity style={styles.editNameButton}>
                <Icon name="edit" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.memberCount}>{group.memberCount} thành viên</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={onSearchMessages}>
              <View style={styles.actionIconContainer}>
                <Icon name="search" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Tìm tin nhắn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="person-add" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Thêm thành viên</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="wallpaper" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Đổi hình nền</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="notifications-off" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Tắt thông báo</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <Icon name={item.icon} size={24} color="#AAAAAA" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#AAAAAA" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Shared Media Preview */}
          <View style={styles.sharedMediaSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ảnh, file, link</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={sharedMedia}
              renderItem={renderSharedMediaItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sharedMediaList}
            />
          </View>

          {/* Group Members */}
          <View style={styles.membersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thành viên nhóm</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Leave Group Button */}
          <TouchableOpacity style={styles.leaveGroupButton}>
            <Icon name="exit-to-app" size={24} color="#FF3B30" />
            <Text style={styles.leaveGroupText}>Rời nhóm</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  groupInfoSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  groupAvatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  groupAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0084FF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  editNameButton: {
    padding: 4,
  },
  memberCount: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  actionButton: {
    alignItems: "center",
    width: 80,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  menuSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 16,
  },
  sharedMediaSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#0084FF",
    fontSize: 14,
  },
  sharedMediaList: {
    paddingHorizontal: 16,
  },
  sharedMediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  membersSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 8,
  },
  adminBadge: {
    color: "#0084FF",
    fontSize: 12,
  },
  lastActive: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  memberActionButton: {
    padding: 8,
  },
  leaveGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginVertical: 20,
  },
  leaveGroupText: {
    color: "#FF3B30",
    fontSize: 16,
    marginLeft: 8,
  },
})

export default GroupInfoModal
