"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { userService } from "../services/userService"
import { useFocusEffect } from "@react-navigation/native"

export default function ProfileScreen({ navigation, route }) {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useFocusEffect(
    useCallback(() => {
      console.log("Profile screen focused - automatically refreshing data")
      fetchUserProfile()
    }, []),
  )

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching user profile data...")
      const response = await userService.getUserProfile()
      console.log("Profile data received:", response)
      setProfileData(response)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.")
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0068FF" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8e8e8e" style={styles.searchIcon} />
          <TextInput placeholder="Tìm kiếm" placeholderTextColor="#8e8e8e" style={styles.searchInput} />
          <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
            <Feather name="settings" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarContainer}>
          <Image
            source={profileData?.avatarUrl ? { uri: profileData.avatarUrl } : require("../assets/avt.png")}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={22} color="#8e8e8e" style={styles.infoIcon} />
              <Text style={styles.label}>Tên Zalo</Text>
              <Text style={styles.value}>{profileData?.fullName || "Chưa cập nhật"}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={22} color="#8e8e8e" style={styles.infoIcon} />
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profileData?.email || "Chưa cập nhật"}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={22} color="#8e8e8e" style={styles.infoIcon} />
              <Text style={styles.label}>Ngày sinh</Text>
              <Text style={styles.value}>{formatDate(profileData?.birthdate) || "Chưa cập nhật"}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="male-female-outline" size={22} color="#8e8e8e" style={styles.infoIcon} />
              <Text style={styles.label}>Giới tính</Text>
              <Text style={styles.value}>{profileData?.gender || "Chưa cập nhật"}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("EditProfileScreen", { profileData })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
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
            <Text style={styles.activeNavText}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
    backgroundColor: "#1A1A1A",
    marginTop: 100,
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2e89ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    padding: 0,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2a2a2a",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  label: {
    color: "#8e8e8e",
    fontSize: 16,
    flex: 1,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2e89ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
})
