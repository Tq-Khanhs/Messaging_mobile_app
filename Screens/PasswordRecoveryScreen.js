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
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

const PasswordRecoveryScreen = ({ navigation }) => {

  const [email, setEmail] = useState("")
  const { requestPasswordReset } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email")
      return
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ")
      return
    }

    console.log(`Attempting password reset for: ${email}`)

    Alert.alert(
      `Xác nhận email ${email}?`,
      "Email này sẽ được sử dụng để nhận mã xác thực",
      [
        {
          text: "HỦY",
          style: "cancel",
        },
        {
          text: "XÁC NHẬN",
          onPress: async () => {
            try {
              setIsLoading(true)
              setError(null)

              const response = await requestPasswordReset(email)

              console.log(`Password reset verification sent to ${email}`)
              if (response.verificationCode) {
                console.log(`Verification code: ${response.verificationCode}`)
              }

              navigation.navigate("Verification", {
                email: email,
                sessionInfo: response.sessionInfo,
                isRegistration: false,
                isPasswordReset: true,
              })
            } catch (err) {
              const errorMessage = err.message || "Không thể gửi yêu cầu. Vui lòng thử lại sau."
              setError(errorMessage)
              Alert.alert("Lỗi", errorMessage)
            } finally {
              setIsLoading(false)
            }
          },
          style: "default",
        },
      ],
      { cancelable: false },
    )
  }

  // Add email validation function
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lấy lại mật khẩu</Text>
      </View>

      {/* Update the instructions text */}
      <Text style={styles.instructions}>Nhập email để lấy lại mật khẩu</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          {/* Update the TextInput for email */}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#666666"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {email.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setEmail("")}>
              <Icon name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Icon name="arrow-forward" size={24} color="#FFFFFF" />}
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
  instructions: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#00A7E7",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
  },
  submitButton: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "#00A7E7",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default PasswordRecoveryScreen
