import { useState } from "react"
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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Format phone number
      let formattedPhoneNumber = phoneNumber
      if (formattedPhoneNumber.startsWith("0")) {
        formattedPhoneNumber = "+84" + formattedPhoneNumber.substring(1)
      } else if (!formattedPhoneNumber.startsWith("+")) {
        formattedPhoneNumber = "+84" + formattedPhoneNumber
      }

      const response = await login(formattedPhoneNumber, password)

      // Navigate to messages screen on successful login
      navigation.reset({
        index: 0,
        routes: [{ name: "MessagesScreen" }],
      })
    } catch (err) {
      const errorMessage = err.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin."
      setError(errorMessage)
      Alert.alert("Lỗi", "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng nhập</Text>
      </View>

      <Text style={styles.instructions}>Vui lòng nhập số điện thoại và mật khẩu để đăng nhập</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Số điện thoại"
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setPhoneNumber("")}>
              <Icon name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            placeholderTextColor="#666666"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showPasswordText}>{showPassword ? "ẨN" : "HIỆN"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate("PasswordRecovery")}>
          <Text style={styles.forgotPasswordText}>Lấy lại mật khẩu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.faqButton}>
          <Text style={styles.faqText}>Câu hỏi thường gặp</Text>
          <Icon name="chevron-right" size={20} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading ? { opacity: 0.7 } : {}]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Icon name="arrow-forward" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  instructions: {
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#0068FF",
    marginBottom: 16,
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
  showPasswordButton: {
    padding: 8,
  },
  showPasswordText: {
    color: "#666666",
    fontSize: 14,
  },
  forgotPasswordButton: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#0068FF",
    fontSize: 14,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1A1A1A",
  },
  faqButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqText: {
    color: "#666666",
    fontSize: 14,
    marginRight: 8,
  },
  loginButton: {
    backgroundColor: "#666666",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default LoginScreen
