import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert } from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      })
    } catch (error) {
      console.error("Logout error:", error)
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const settingsItems = [
    // {
    //   id: "account",
    //   title: "Tài khoản và bảo mật",
    //   icon: <Ionicons name="shield-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("AccountSecurity"),
    // },
    {
      id: "password",
      title: "Cập nhật mật khẩu",
      icon: <Ionicons name="lock-closed-outline" size={24} color="#0068FF" />,
      onPress: () => navigation.navigate("UpdatePasswordScreen"),
    },
    // {
    //   id: "data",
    //   title: "Dữ liệu trên máy",
    //   icon: <Ionicons name="time-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("DeviceData"),
    // },
    // {
    //   id: "backup",
    //   title: "Sao lưu và khôi phục",
    //   icon: <Ionicons name="refresh-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("BackupRestore"),
    // },
    // {
    //   id: "notifications",
    //   title: "Thông báo",
    //   icon: <Ionicons name="notifications-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("Notifications"),
    // },
    // {
    //   id: "messages",
    //   title: "Tin nhắn",
    //   icon: <Ionicons name="chatbubble-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("MessageSettings"),
    // },
    // {
    //   id: "calls",
    //   title: "Cuộc gọi",
    //   icon: <Ionicons name="call-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("CallSettings"),
    // },
    // {
    //   id: "journal",
    //   title: "Nhật ký",
    //   icon: <Ionicons name="time-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("Journal"),
    // },
    // {
    //   id: "contacts",
    //   title: "Danh bạ",
    //   icon: <Ionicons name="people-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("ContactSettings"),
    // },
    // {
    //   id: "interface",
    //   title: "Giao diện và ngôn ngữ",
    //   icon: <Ionicons name="color-palette-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("InterfaceLanguage"),
    // },
    // {
    //   id: "about",
    //   title: "Thông tin về Zalo",
    //   icon: <Ionicons name="information-circle-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("AboutZalo"),
    // },
    // {
    //   id: "support",
    //   title: "Liên hệ hỗ trợ",
    //   icon: <Ionicons name="help-circle-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("Support"),
    // },
    // {
    //   id: "switch",
    //   title: "Chuyển tài khoản",
    //   icon: <Ionicons name="people-circle-outline" size={24} color="#0068FF" />,
    //   onPress: () => navigation.navigate("SwitchAccount"),
    // },
  ]

  const renderSettingsItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.settingsItem} onPress={item.onPress}>
      <View style={styles.settingsItemLeft}>
        {item.icon}
        <Text style={styles.settingsItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {settingsItems.map((item) => renderSettingsItem(item))}

        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoading}>
            <Feather name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ContactsScreen")}>
          <Ionicons name="people" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="person-outline" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Cá nhân</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  searchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButtonContainer: {
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 24,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
    backgroundColor: "#1A1A1A",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: "#0068FF",
  },
  activeNavText: {
    color: "#0068FF",
    fontSize: 12,
    marginTop: 2,
  },
})

export default SettingsScreen
