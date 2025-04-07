"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useRoute } from "@react-navigation/native"

export default function EnterZaloNameScreen({ navigation }) {
  const [name, setName] = useState("")
  const [isValid, setIsValid] = useState(false)
  const route = useRoute()
  const { phoneNumber, firebaseUid, password } = route.params || {}
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const hasNoNumbers = !/[\d０-９]/.test(name)
    const validLength = name.length >= 2 && name.length <= 40
    setIsValid(hasNoNumbers && validLength && name.trim() !== "")
  }, [name])

  const handleTextChange = (text) => {
    setName(text)
  }

  const handleContinue = async () => {
    if (!isValid) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Store the name for later use in registration
      navigation.navigate("PersonalInfo", {
        phoneNumber,
        firebaseUid,
        password,
        fullName: name,
      })
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.")
      Alert.alert("Lỗi", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nhập tên Zalo</Text>
          <Text style={styles.subtitle}>Hãy dùng tên thật để mọi người dễ nhận ra bạn</Text>
        </View>

        <TextInput
          style={styles.input}
          value={name}
          placeholder="Nguyễn Văn A"
          placeholderTextColor="#555555"
          onChangeText={handleTextChange}
          selectionColor="#0A84FF"
          autoCorrect={false}
          autoCapitalize="words"
          keyboardType="default"
          textContentType="name"
          returnKeyType="done"
          blurOnSubmit={true}
          maxLength={40}
          allowFontScaling={false}
          spellCheck={false}
          contextMenuHidden={false}
        />

        <View style={styles.requirementsContainer}>
          <View style={styles.requirementRow}>
            <Text style={styles.bullet}>•</Text>
            <Text
              style={[
                styles.requirementText,
                name.length > 0 && name.length >= 2 && name.length <= 40 ? styles.validRequirement : {},
              ]}
            >
              Dài từ 2 đến 40 ký tự
            </Text>
          </View>

          <View style={styles.requirementRow}>
            <Text style={styles.bullet}>•</Text>
            <Text
              style={[
                styles.requirementText,
                name.length > 0 && !/[\d０-９]/.test(name) ? styles.validRequirement : {},
              ]}
            >
              Không chứa số
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !isValid || isLoading ? {} : styles.continueButtonActive]}
        disabled={!isValid || isLoading}
        onPress={handleContinue}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    borderWidth: 1,
    borderColor: "#0A84FF",
    borderRadius: 8,
    color: "white",
    fontSize: 16,
    padding: 12,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  requirementsContainer: {
    marginTop: 10,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    color: "#8E8E93",
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  requirementText: {
    color: "#8E8E93",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  validRequirement: {
    color: "#4CD964",
  },
  link: {
    color: "#0A84FF",
    textDecorationLine: "none",
  },
  continueButton: {
    backgroundColor: "#333333",
    borderRadius: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  continueButtonActive: {
    backgroundColor: "#0A84FF",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
})

