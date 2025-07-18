"use client"

import { useRef } from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import { useRoute } from "@react-navigation/native"

const VerificationScreen = ({ navigation }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef([])

  const { verifyEmail, verifyResetCode } = useAuth()
  const route = useRoute()
  const { email, sessionInfo, isRegistration, isPasswordReset } = route.params || {}
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCodeChange = (text, index) => {
    const newCode = [...code]
    newCode[index] = text
    setCode(newCode)

    if (text && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerification = async () => {
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 chữ số")
      return
    }

    console.log(`Verifying code: ${verificationCode} for email: ${email}`)
    console.log(`Is password reset: ${isPasswordReset ? "Yes" : "No"}`)

    try {
      setIsLoading(true)
      setError(null)

      if (isPasswordReset) {
        console.log("Using password reset verification flow")
        const response = await verifyResetCode(verificationCode)
        console.log("Reset code verification successful!")
        console.log("Reset token received:", response.resetToken ? "Yes" : "No")
        console.log("User ID received:", response.userId)
        navigation.navigate("CreateNewPassword")
      } else {
        console.log("Using registration verification flow")
        const response = await verifyEmail(verificationCode)

        console.log("Verification successful!")

        if (isRegistration) {
          console.log("Proceeding with registration flow")
          navigation.navigate("CreatePasswordScreen", {
            email,
            userId: response.userId,
          })
        } else {
          console.log("Proceeding to success screen")
          navigation.navigate("Success")
        }
      }
    } catch (err) {
      const errorMessage = err.message || "Mã xác thực không đúng. Vui lòng thử lại."
      setError(errorMessage)
      console.error("Lỗi xác thực", "Mã xác thực không đúng. Vui lòng thử lại.")
      Alert.alert("Lỗi xác thực", "Mã xác thực không đúng. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập mã xác thực</Text>
      </View>

      <Text style={styles.warningText}>Vui lòng không chia sẻ mã xác thực để tránh mất tài khoản</Text>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon name="chat" size={40} color="#00A7E7" />
        </View>
      </View>

      <Text style={styles.phoneNumber}>{email || "example@email.com"}</Text>

      <Text style={styles.instructions}>Soạn tin nhắn nhận mã xác thực và điền vào bên dưới</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity>
        <Text style={styles.guideLink}>Hướng dẫn nhận mã</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.continueButton, code.every((digit) => digit) ? styles.continueButtonActive : {}]}
        disabled={!code.every((digit) => digit) || isLoading}
        onPress={handleVerification}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
      </TouchableOpacity>
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
  warningText: {
    color: "#FFFFFF",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000000",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  instructions: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  codeInput: {
    width: 40,
    height: 54,
    borderBottomWidth: 2,
    borderBottomColor: "#666666",
    color: "#FFFFFF",
    fontSize: 24,
    textAlign: "center",
  },
  guideLink: {
    color: "#00A7E7",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  continueButton: {
    backgroundColor: "#333333",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  continueButtonActive: {
    backgroundColor: "#00A7E7",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
})

export default VerificationScreen
