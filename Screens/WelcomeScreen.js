"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  SafeAreaView,
  Modal,
} from "react-native"

const { width, height } = Dimensions.get("window")

const WelcomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("Tiếng Việt")

  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  const selectLanguage = (language) => {
    setSelectedLanguage(language)
    setModalVisible(false)
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <TouchableOpacity style={styles.languageSelector} onPress={toggleModal}>
        <Text style={styles.languageText}>{selectedLanguage}</Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/icon.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={toggleModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngôn ngữ</Text>
            </View>
            <TouchableOpacity style={styles.languageOption} onPress={() => selectLanguage("Tiếng Việt")}>
              <Text style={styles.languageOptionText}>Tiếng Việt</Text>
              {selectedLanguage === "Tiếng Việt" && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageOption} onPress={() => selectLanguage("English")}>
              <Text style={styles.languageOptionText}>English</Text>
              {selectedLanguage === "English" && <Text style={styles.checkmark}>✓</Text>}
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
    backgroundColor: "#1A1A1A",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    marginRight: 16,
  },
  languageText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 4,
  },
  chevron: {
    color: "#FFFFFF",
    fontSize: 10,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  cityscapeContainer: {
    position: "absolute",
    bottom: 200,
    width: width,
    height: height * 0.3,
    opacity: 0.1,
  },
  cityscape: {
    width: "100%",
    height: "100%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    opacity: 0.3,
  },
  paginationDotActive: {
    backgroundColor: "#0068FF",
    opacity: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loginButton: {
    backgroundColor: "#0068FF",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#333333",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  languageOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  checkmark: {
    color: "#0068FF",
    fontSize: 20,
  },
})

export default WelcomeScreen
