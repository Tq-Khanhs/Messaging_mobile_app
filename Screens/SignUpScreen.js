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
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"

const { width } = Dimensions.get("window")

// Fallback implementation for useAuth
const useAuthFallback = () => {
  return {
    requestVerificationCode: async () => {
      console.warn("Fallback: requestVerificationCode called")
      return Promise.resolve()
    },
    error: null,
  }
}

const SignUpScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [socialTermsAccepted, setSocialTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const auth = useAuth() || useAuthFallback()

  const { requestVerificationCode, error } = auth

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  // Update the handleContinue function to use email
  const handleContinue = async () => {
    if (!termsAccepted || !socialTermsAccepted) {
      return
    }

    if (!email || email.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập email")
      return
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ")
      return
    }

    try {
      setIsLoading(true)
      await requestVerificationCode(email)
      navigation.navigate("Verification", {
        email: email,
        isRegistration: true,
      })
    } catch (err) {
      Alert.alert("Lỗi", "Email đã được dùng để đăng ký tài khoản khác")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Welcome")}>
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Update the title and input field */}
      <Text style={styles.title}>Nhập email</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666666"
          placeholder="Nhập email"
        />
      </View>

      <View style={styles.termsContainer}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với các <Text style={styles.termsLink}>điều khoản sử dụng Zalo</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setSocialTermsAccepted(!socialTermsAccepted)}>
          <View style={[styles.checkbox, socialTermsAccepted && styles.checkboxChecked]}>
            {socialTermsAccepted && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với <Text style={styles.termsLink}>điều khoản Mạng xã hội của Zalo</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!termsAccepted || !socialTermsAccepted || isLoading) && styles.continueButtonDisabled,
        ]}
        disabled={!termsAccepted || !socialTermsAccepted || isLoading}
        onPress={handleContinue}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#0068FF",
    borderRadius: 8,
    height: 48,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#333333",
  },
  countryCodeText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 12,
  },
  termsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#666666",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0068FF",
    borderColor: "#0068FF",
  },
  termsText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: "#0068FF",
  },
  continueButton: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 48,
    backgroundColor: "#0068FF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#333333",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  loginLink: {
    color: "#0068FF",
    fontSize: 14,
  },
})

export default SignUpScreen
