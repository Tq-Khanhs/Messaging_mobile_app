"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

const CreatePasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeInput, setActiveInput] = useState(null)
  const [showDebugMode, setShowDebugMode] = useState(false)

  const { completePasswordReset, resetPasswordData } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("CreateNewPassword screen loaded")
    console.log("Reset password data:", resetPasswordData ? "Available" : "Not available")
    if (resetPasswordData) {
      console.log("Reset token available:", resetPasswordData.resetToken ? "Yes" : "No")
      console.log("User ID:", resetPasswordData.userId)
    }
  }, [resetPasswordData])

  const handleUpdate = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu không khớp")
      return
    }

    if (password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    if (!resetPasswordData || !resetPasswordData.resetToken) {
      Alert.alert("Lỗi", "Không tìm thấy mã xác thực. Vui lòng thực hiện lại quá trình lấy lại mật khẩu.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("PasswordRecovery"),
        },
      ])
      return
    }

    try {
      setIsLoading(true)
      setError(null)


      console.log("Attempting to complete password reset")
      console.log(`Reset token: ${resetPasswordData.resetToken.substring(0, 10)}...`)

      await completePasswordReset(password)


      console.log("Password successfully reset")

      Alert.alert("Thành công", "Mật khẩu đã được cập nhật thành công", [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          },
        },
      ])
    } catch (err) {
      const errorMessage = err.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại."
      setError(errorMessage)
      console.error("Password reset failed:", errorMessage)
      Alert.alert("Lỗi", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const [tapCount, setTapCount] = useState(0)
  const handleHeaderTap = () => {
    const newCount = tapCount + 1
    setTapCount(newCount)

    if (newCount >= 5) {
      setShowDebugMode(!showDebugMode)
      setTapCount(0)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />

      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHeaderTap}>
            <Text style={styles.headerTitle}>Tạo mật khẩu mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên Zalo của bạn.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setActiveInput("password")}
                onBlur={() => setActiveInput(null)}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#666666"
              />
              <TouchableOpacity style={styles.showButton} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showButtonText}>HIỆN</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputUnderline, activeInput === "password" && styles.activeUnderline]} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setActiveInput("confirm")}
                onBlur={() => setActiveInput(null)}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#666666"
              />
            </View>
            <View style={[styles.inputUnderline, activeInput === "confirm" && styles.activeUnderline]} />
          </View>

          {showDebugMode && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Thông tin gỡ lỗi</Text>

              <View style={styles.debugInfo}>
                <Text style={styles.debugLabel}>Reset Data:</Text>
                <Text style={styles.debugValue}>{resetPasswordData ? "Có sẵn" : "Không có sẵn"}</Text>
              </View>

              {resetPasswordData && (
                <>
                  <View style={styles.debugInfo}>
                    <Text style={styles.debugLabel}>Phone:</Text>
                    <Text style={styles.debugValue}>{resetPasswordData.phoneNumber}</Text>
                  </View>

                  <View style={styles.debugInfo}>
                    <Text style={styles.debugLabel}>Session:</Text>
                    <Text style={styles.debugValue}>
                      {resetPasswordData.sessionInfo ? resetPasswordData.sessionInfo.substring(0, 10) + "..." : "N/A"}
                    </Text>
                  </View>

                  <View style={styles.debugInfo}>
                    <Text style={styles.debugLabel}>Reset Token:</Text>
                    <Text style={styles.debugValue}>
                      {resetPasswordData.resetToken
                        ? resetPasswordData.resetToken.substring(0, 10) + "..."
                        : "Không có (chưa xác thực)"}
                    </Text>
                  </View>

                  <View style={styles.debugInfo}>
                    <Text style={styles.debugLabel}>User ID:</Text>
                    <Text style={styles.debugValue}>{resetPasswordData.userId || "N/A"}</Text>
                  </View>

                  <View style={styles.debugInfo}>
                    <Text style={styles.debugLabel}>Verified:</Text>
                    <Text style={styles.debugValue}>
                      {resetPasswordData.verified ? "Đã xác thực" : "Chưa xác thực"}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            password === confirmPassword && password.length > 0 ? styles.updateButtonActive : {},
          ]}
          onPress={handleUpdate}
          disabled={password !== confirmPassword || password.length === 0 || isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateButtonText}>CẬP NHẬT</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1B1B",
  },
  statusBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#666666",
    marginTop: 4,
  },
  activeUnderline: {
    height: 2,
    backgroundColor: "#00A7E7",
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    color: "#666666",
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: "#333333",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 32,
  },
  updateButtonActive: {
    backgroundColor: "#00A7E7",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  debugTitle: {
    color: "#FF9500",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  debugInfo: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  debugLabel: {
    color: "#FF9500",
    fontSize: 14,
    width: 100,
  },
  debugValue: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
  },
})

export default CreatePasswordScreen
