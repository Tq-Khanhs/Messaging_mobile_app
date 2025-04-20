"use client"

import { useState } from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native"
import { useRoute } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import apiService from "../../services/api"

const ContactProfile = ({ onClose, navigation }) => {
  const defaultContact = {
    id: "sample-id",
    name: "Nguyễn Minh Đức",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    online: false,
  }
  const route = useRoute()
  const contact = route.params?.contact || defaultContact

  const [loading, setLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleCall = () => {
    navigation.navigate("Call", { contact })
  }

  const handleChat = () => {
    // If onClose exists (modal context), close it
    if (onClose) {
      onClose()
    }
    // Navigate to ChatDetail with contact information
    navigation.navigate("ChatDetail", {
      contact: {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        online: contact.online,
      },
    })
  }

  const handleRemoveFriend = async () => {
    Alert.alert(
      "Xóa bạn",
      `Bạn có chắc muốn xóa ${contact.name} khỏi danh sách bạn bè?`,
      [
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
              await apiService.contacts.removeContact(contact.id)
              Alert.alert("Thành công", "Đã xóa bạn bè thành công")
              if (onClose) onClose()
              navigation.goBack()
            } catch (error) {
              console.error("Error removing contact:", error)
              Alert.alert("Lỗi", "Không thể xóa bạn bè. Vui lòng thử lại sau.")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleBlock = async () => {
    Alert.alert(
      "Chặn người dùng",
      `Bạn có chắc muốn chặn ${contact.name}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Chặn",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              await apiService.contacts.blockContact(contact.id)
              Alert.alert("Thành công", "Đã chặn người dùng thành công")
              if (onClose) onClose()
              navigation.goBack()
            } catch (error) {
              console.error("Error blocking contact:", error)
              Alert.alert("Lỗi", "Không thể chặn người dùng. Vui lòng thử lại sau.")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (onClose) onClose()
            else navigation.goBack()
          }}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCall}>
            <Icon name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={() => setShowOptions(!showOptions)}>
            <Icon name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Content */}
      <View style={styles.profileContent}>
        <Image
          source={{ uri: contact?.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{contact?.name || "Nguyễn Minh Đức"}</Text>

        {contact.online ? (
          <View style={styles.statusContainer}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>Offline</Text>
        )}
      </View>

      {/* Chat Button */}
      <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
        <Icon name="chat" size={24} color="#FFFFFF" />
        <Text style={styles.chatButtonText}>Nhắn tin</Text>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem} onPress={handleRemoveFriend}>
              <Icon name="person-remove" size={24} color="#FF6B6B" />
              <Text style={styles.optionText}>Xóa bạn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
              <Icon name="block" size={24} color="#FF6B6B" />
              <Text style={styles.optionText}>Chặn</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0084FF" />
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
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1E1E1E",
  },
  backButton: {
    padding: 5,
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 5,
    marginLeft: 20,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#0084FF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  chatButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#0084FF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 15,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
})

export default ContactProfile
