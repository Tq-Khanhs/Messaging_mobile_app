"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute } from "@react-navigation/native"
import { userService } from "../services/userService"
import * as ImagePicker from "expo-image-picker"

const EditProfileScreen = ({ navigation }) => {
  const route = useRoute()
  const { profileData } = route.params || {}

  const [name, setName] = useState(profileData?.fullName || "")
  const [dob, setDob] = useState(profileData?.birthdate ? formatDate(profileData.birthdate) : "")
  const [gender, setGender] = useState(profileData?.gender || "Nam")
  const [avatar, setAvatar] = useState(profileData?.avatarUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)

  // Thêm các state để theo dõi giá trị ban đầu và thay đổi
  const [originalName] = useState(profileData?.fullName || "")
  const [originalDob] = useState(profileData?.birthdate ? formatDate(profileData.birthdate) : "")
  const [originalGender] = useState(profileData?.gender || "Nam")
  const [originalAvatar] = useState(profileData?.avatarUrl || null)
  const [pendingAvatar, setPendingAvatar] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  function parseDate(dateString) {
    if (!dateString) return null
    const parts = dateString.split("/")
    if (parts.length !== 3) return null
    return new Date(parts[2], parts[1] - 1, parts[0])
  }

  function checkForChanges() {
    return (
      name !== originalName ||
      dob !== originalDob ||
      gender !== originalGender ||
      pendingAvatar !== null ||
      avatar !== originalAvatar
    )
  }

  const handleBackPress = () => {
    if (checkForChanges()) {
      Alert.alert(
        "Lưu thay đổi",
        "Bạn có muốn lưu các thay đổi không?",
        [
          {
            text: "Không",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          {
            text: "Có",
            onPress: handleSave,
          },
        ],
        { cancelable: false },
      )
    } else {
      navigation.goBack()
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên")
      return
    }

    try {
      setIsLoading(true)
      const userData = {
        fullName: name,
        gender: gender,
      }

      const parsedDate = parseDate(dob)
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        userData.birthdate = parsedDate.toISOString()
      }

      if (pendingAvatar) {
        try {
          // Sử dụng hàm uploadImage mới để tải lên ảnh
          const uploadResult = await userService.uploadImage(pendingAvatar)

          // Kiểm tra kết quả và cập nhật URL avatar trong dữ liệu người dùng
          if (uploadResult && uploadResult.imageUrl) {
            userData.avatarUrl = uploadResult.imageUrl
          } else if (uploadResult && uploadResult.imageUrl) {
            userData.avatarUrl = uploadResult.imageUrl
          } else {
            console.error("Upload successful but no image URL returned:", uploadResult)
          }
        } catch (avatarError) {
          console.error("Failed to upload avatar:", avatarError)
          Alert.alert("Cảnh báo", "Không thể tải lên ảnh đại diện. Vẫn tiếp tục cập nhật thông tin khác.")
          // Tiếp tục cập nhật thông tin người dùng ngay cả khi upload avatar thất bại
        }
      }

      // Cập nhật thông tin người dùng
      await userService.updateUserProfile(userData)

      Alert.alert("Thành công", "Thông tin đã được cập nhật", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (error) {
      console.error("Failed to update profile:", error)
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const pickImage = async () => {
    setShowImageOptions(false)

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri
        setPendingAvatar(selectedImageUri)
        setAvatar(selectedImageUri)
        setHasChanges(true)
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.")
    }
  }

  const takePhoto = async () => {
    setShowImageOptions(false)

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào máy ảnh để chụp ảnh.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri
        setPendingAvatar(selectedImageUri)
        setAvatar(selectedImageUri)
        setHasChanges(true)
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#0068FF" />
        ) : (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowImageOptions(true)}>
          <Image source={avatar ? { uri: avatar } : require("../assets/avt.png")} style={styles.avatar} />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên Zalo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text)
              setHasChanges(checkForChanges())
            }}
            placeholder="Nhập tên Zalo"
            placeholderTextColor="#555"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={(text) => {
              setDob(text)
              setHasChanges(checkForChanges())
            }}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#555"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <TouchableOpacity style={styles.genderSelector} onPress={() => setShowGenderPicker(true)}>
            <Text style={styles.genderText}>{gender}</Text>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showGenderPicker}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderPicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLine} />
              <Text style={styles.modalTitle}>Chọn giới tính</Text>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setGender("Nam")
                setShowGenderPicker(false)
                setHasChanges(checkForChanges())
              }}
            >
              <Text style={styles.modalOptionText}>Nam</Text>
              {gender === "Nam" && <Ionicons name="checkmark" size={24} color="#0068FF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setGender("Nữ")
                setShowGenderPicker(false)
                setHasChanges(checkForChanges())
              }}
            >
              <Text style={styles.modalOptionText}>Nữ</Text>
              {gender === "Nữ" && <Ionicons name="checkmark" size={24} color="#0068FF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setGender("Khác")
                setShowGenderPicker(false)
                setHasChanges(checkForChanges())
              }}
            >
              <Text style={styles.modalOptionText}>Khác</Text>
              {gender === "Khác" && <Ionicons name="checkmark" size={24} color="#0068FF" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        visible={showImageOptions}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImageOptions(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLine} />
              <Text style={styles.modalTitle}>Cập nhật ảnh đại diện</Text>
            </View>

            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#fff" style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Chụp ảnh mới</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#fff" style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Chọn ảnh từ thư viện</Text>
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
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  saveText: {
    color: "#0068FF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#0068FF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#8e8e8e",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1c1c1e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  genderSelector: {
    backgroundColor: "#1c1c1e",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  genderText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 30,
  },
  modalHeader: {
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
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalOptionText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  modalOptionIcon: {
    marginRight: 16,
  },
})

export default EditProfileScreen
