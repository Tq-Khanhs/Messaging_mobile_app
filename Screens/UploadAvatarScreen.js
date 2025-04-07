"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"
import { useAuth } from "../context/AuthContext"
import { userService } from "../services/userService"
import { useRoute } from "@react-navigation/native"

export default function UpdateProfilePictureScreen({ navigation }) {
  const route = useRoute()
  const { fullName = "Trần Quốc Khánh", phoneNumber, firebaseUid, password, birthdate, gender } = route.params || {}

  const [profileImage, setProfileImage] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [initials, setInitials] = useState("")
  const [avatarColor, setAvatarColor] = useState("#C084FC")

  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (fullName) {
      const nameParts = fullName.split(" ").filter((part) => part.length > 0)
      if (nameParts.length >= 2) {
        // Get first letter of first name and first letter of last name
        const firstInitial = nameParts[0].charAt(0)
        const lastInitial = nameParts[nameParts.length - 1].charAt(0)
        setInitials(`${firstInitial}${lastInitial}`)
      } else if (nameParts.length === 1) {
        // If only one name, use first two letters
        setInitials(nameParts[0].substring(0, 2))
      }
    }
  }, [fullName])

  // Request camera permissions
  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  // Take a new photo
  const takePhoto = async () => {
    setShowOptions(false)

    if (!hasPermission) {
      Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào máy ảnh để chụp ảnh.", [{ text: "OK" }])
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.")
    }
  }

  const pickImage = async () => {
    setShowOptions(false)

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.")
    }
  }

  const uploadProfilePicture = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let avatarUrl = null

      // If user has selected a profile image, upload it
      if (profileImage) {
        try {
          // Get upload URL
          const uploadUrlResponse = await userService.getAvatarUploadUrl("image/jpeg")
          const { uploadUrl, key } = uploadUrlResponse

          // Upload to S3
          await userService.uploadToS3(uploadUrl, profileImage, "image/jpeg")

          // Confirm upload
          const confirmResponse = await userService.confirmAvatarUpload(key)
          avatarUrl = confirmResponse.avatarUrl
        } catch (err) {
          console.error("Failed to upload avatar:", err)
          // Continue registration even if avatar upload fails
        }
      }

      // Complete registration
      const userData = {
        phoneNumber,
        password,
        fullName,
        birthdate,
        gender,
        firebaseUid,
        avatarUrl,
      }

      await register(userData)

      // Navigate to messages screen
      navigation.navigate("MessagesScreen")
    } catch (err) {
      setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.")
      Alert.alert("Lỗi", error)
    } finally {
      setIsLoading(false)
    }
  }

  const skipProfilePicture = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Complete registration without avatar
      const userData = {
        phoneNumber,
        password,
        fullName,
        birthdate,
        gender,
        firebaseUid,
      }

      await register(userData)

      // Navigate to messages screen
      navigation.navigate("MessagesScreen")
    } catch (err) {
      setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.")
      Alert.alert("Lỗi", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <Text style={styles.title}>Cập nhật ảnh đại diện</Text>
        <Text style={styles.subtitle}>Đặt ảnh đại diện để mọi người dễ nhận ra bạn</Text>

        <TouchableOpacity style={styles.profileImageContainer} onPress={() => setShowOptions(true)}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.initialsContainer, { backgroundColor: avatarColor }]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Update Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={uploadProfilePicture} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateButtonText}>Cập nhật</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={skipProfilePicture} disabled={isLoading}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Options Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showOptions}
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptions(false)}>
          <View style={styles.optionsContainer}>
            <View style={styles.optionsHeader}>
              <View style={styles.optionsHeaderLine} />
            </View>

            <TouchableOpacity style={styles.optionItem} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Chụp ảnh mới</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#FFFFFF" />
              <Text style={styles.optionText}>Chọn ảnh trên máy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginTop: 20,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  updateButton: {
    backgroundColor: "#0A84FF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  skipButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  optionsHeader: {
    alignItems: "center",
    paddingVertical: 12,
  },
  optionsHeaderLine: {
    width: 36,
    height: 5,
    backgroundColor: "#555",
    borderRadius: 3,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  optionText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
})

