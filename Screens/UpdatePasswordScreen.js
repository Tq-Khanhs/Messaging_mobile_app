"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { userService } from "../services/userService"

const UpdatePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeInput, setActiveInput] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự")
      return
    }

    const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword)
    if (!hasLettersAndNumbers) {
      Alert.alert("Lỗi", "Mật khẩu phải gồm chữ và số")
      return
    }

    try {
      setIsLoading(true)

      await userService.updatePassword(currentPassword, newPassword)

      Alert.alert("Thành công", "Mật khẩu đã được cập nhật", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Failed to update password:", error)

      let errorMessage = "Không thể cập nhật mật khẩu. Vui lòng thử lại."
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }

      Alert.alert("Lỗi", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật mật khẩu</Text>
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>Mật khẩu phải gồm chữ và số, phải có ít nhất 8 ký tự.</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại:</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#666666"
              onFocus={() => setActiveInput("current")}
              onBlur={() => setActiveInput(null)}
            />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Text style={styles.showHideText}>{showCurrentPassword ? "ẨN" : "HIỆN"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputUnderline, activeInput === "current" && styles.activeInputUnderline]} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới:</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#666666"
              onFocus={() => setActiveInput("new")}
              onBlur={() => setActiveInput(null)}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Text style={styles.showHideText}>{showNewPassword ? "ẨN" : "HIỆN"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputUnderline, activeInput === "new" && styles.activeInputUnderline]} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nhập lại mật khẩu mới:</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#666666"
              onFocus={() => setActiveInput("confirm")}
              onBlur={() => setActiveInput(null)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.showHideText}>{showConfirmPassword ? "ẨN" : "HIỆN"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputUnderline, activeInput === "confirm" && styles.activeInputUnderline]} />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.updateButton,
          currentPassword && newPassword && confirmPassword ? styles.updateButtonActive : {},
        ]}
        onPress={handleUpdatePassword}
        disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateButtonText}>CẬP NHẬT</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },
  warningContainer: {
    backgroundColor: "#000000",
    padding: 16,
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
    flex: 1,
  },
  showHideText: {
    color: "#666666",
    fontSize: 14,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#666666",
    marginTop: 4,
  },
  activeInputUnderline: {
    height: 2,
    backgroundColor: "#0068FF",
  },
  updateButton: {
    backgroundColor: "#333333",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  updateButtonActive: {
    backgroundColor: "#0068FF",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default UpdatePasswordScreen
