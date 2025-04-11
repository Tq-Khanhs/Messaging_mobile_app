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
import { useRoute } from "@react-navigation/native"
import * as FileSystem from "expo-file-system"

export default function UpdateProfilePictureScreen({ navigation }) {
  const route = useRoute()
  const { fullName, email, userId, password, birthdate, gender } = route.params || {}

  const [profileImage, setProfileImage] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)

  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("UploadAvatarScreen - Route Params:", {
      fullName,
      email,
      userId,
      password: password ? "***" : undefined,
      birthdate,
      gender,
    })
  }, [fullName, email, userId, password, birthdate, gender])

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

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

      if (profileImage) {
        try {
          console.log("Starting avatar upload process...")

          const formData = new FormData()

          const uriParts = profileImage.split(".")
          const fileType = uriParts[uriParts.length - 1]
          const fileName = `avatar.${fileType}`

          const fileInfo = await FileSystem.getInfoAsync(profileImage)
          console.log("File info:", fileInfo)

          formData.append("image", {
            uri: profileImage,
            name: fileName,
            type: `image/${fileType}`,
          })

          console.log("Uploading image to server...")

          const response = await fetch("http://172.19.192.1:5000/api/images/upload", {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Upload failed with status: ${response.status}, ${errorText}`)
          }

          const data = await response.json()

          avatarUrl = data.imageUrl
          console.log("Image uploaded successfully, URL:", avatarUrl)
          console.log("Image key:", data.key)
        } catch (err) {
          console.error("Failed to upload avatar:", err)
          avatarUrl =
            "https://ozagioltbnrtpewkouxs.supabase.co/storage/v1/object/public/images/images/2fddee0f-39f4-472d-9e89-5aa0099fae84.png"
          Alert.alert("Cảnh báo", "Không thể tải lên ảnh đại diện. Sẽ sử dụng ảnh mặc định.", [{ text: "OK" }])
        }
      } else {
        avatarUrl =
          "https://ozagioltbnrtpewkouxs.supabase.co/storage/v1/object/public/images/images/2fddee0f-39f4-472d-9e89-5aa0099fae84.png"
        console.log("Using default avatar URL:", avatarUrl)
      }

      const userData = {
        email,
        password,
        fullName,
        birthdate,
        gender,
        userId,
        avatarUrl,
      }

      console.log("Registering user with avatar URL:", avatarUrl)
      await register(userData)
      console.log("Registration complete")

      navigation.navigate("MessagesScreen")
    } catch (err) {
      console.error("Profile picture upload/registration error:", err)
      setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.")
      Alert.alert("Lỗi", err.message || "Đăng ký không thành công. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const skipProfilePicture = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const defaultAvatarUrl =
        "https://ozagioltbnrtpewkouxs.supabase.co/storage/v1/object/public/images/images/2fddee0f-39f4-472d-9e89-5aa0099fae84.png"
      console.log("Skipping profile picture, using default URL:", defaultAvatarUrl)

      const userData = {
        email,
        password,
        fullName,
        birthdate,
        gender,
        userId,
        avatarUrl: defaultAvatarUrl,
      }

      await register(userData)
      console.log("Registration with default avatar complete")

      navigation.navigate("MessagesScreen")
    } catch (err) {
      console.error("Registration with default avatar error:", err)
      setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.")
      Alert.alert("Lỗi", err.message || "Đăng ký không thành công. Vui lòng thử lại.")
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
            <Image source={require("../assets/avt.png")} style={styles.profileImage} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={uploadProfilePicture} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateButtonText}>Cập nhật</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={skipProfilePicture} disabled={isLoading}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

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
