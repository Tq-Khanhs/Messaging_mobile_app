"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  StatusBar,
  SafeAreaView,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { Ionicons } from "@expo/vector-icons"

const CreateGroupScreen = ({ navigation }) => {
  const [selectedContacts, setSelectedContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("recent")
  const [groupName, setGroupName] = useState("")
  
  // Mock data for recent contacts
  const recentContacts = [
    {
      id: "1",
      name: "Trần Quốc Khánh",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      lastActive: "1 giờ trước",
    },
    {
      id: "2",
      name: "Bùi Thương Văn",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "3",
      name: "🐝",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "4",
      name: "Ngọc Ánh Dienmay Tlc",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "5",
      name: "Tường Hào",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "6",
      name: "Trung Nguyễn",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "7",
      name: "Giặt Sấy",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      lastActive: "1 ngày trước",
    },
    {
      id: "8",
      name: "Kiều Anh",
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
      lastActive: "2 ngày trước",
    },
    {
      id: "9",
      name: "Nguyen Ngoc Dung",
      avatar: "https://randomuser.me/api/portraits/women/9.jpg",
      lastActive: "2 ngày trước",
    },
    {
      id: "10",
      name: "Hoàng Kiệt",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      lastActive: "2 ngày trước",
    },
  ]

  // Mock data for all contacts (for the "DANH BẠ" tab)
  const allContacts = [
    ...recentContacts,
    {
      id: "11",
      name: "Anh Khánh",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      lastActive: "3 ngày trước",
    },
    {
      id: "12",
      name: "Bạn Tú",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      lastActive: "1 tuần trước",
    },
  ]

  const toggleContactSelection = (contactId) => {
    setSelectedContacts((prevSelected) => {
      if (prevSelected.includes(contactId)) {
        return prevSelected.filter((id) => id !== contactId)
      } else {
        return [...prevSelected, contactId]
      }
    })
  }

  const filteredContacts = () => {
    const contacts = activeTab === "recent" ? recentContacts : allContacts
    
    if (!searchQuery.trim()) {
      return contacts
    }
    
    const query = searchQuery.toLowerCase().trim()
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query)
    )
  }

  const renderContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.checkboxContainer, 
          selectedContacts.includes(item.id) && styles.checkboxSelected
        ]}
        onPress={() => toggleContactSelection(item.id)}
      >
        {selectedContacts.includes(item.id) && (
          <Icon name="check" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  )

  const handleCreateGroup = () => {
    // Here you would typically create the group with the selected contacts
    // and navigate to the new group chat
    console.log("Creating group with:", selectedContacts)
    console.log("Group name:", groupName || "New Group")
    
    // Navigate back or to the new group chat
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Nhóm mới</Text>
          <Text style={styles.selectedCount}>Đã chọn: {selectedContacts.length}</Text>
        </View>
      </View>
      
      {/* Group Name Input */}
      <View style={styles.groupNameContainer}>
        <View style={styles.groupAvatarPlaceholder}>
          <Icon name="camera-alt" size={24} color="#FFFFFF" />
        </View>
        
        <TextInput
          style={styles.groupNameInput}
          placeholder="Đặt tên nhóm"
          placeholderTextColor="#888888"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.keyboardNumber}>123</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "recent" && styles.activeTabButton]}
          onPress={() => setActiveTab("recent")}
        >
          <Text style={[styles.tabText, activeTab === "recent" && styles.activeTabText]}>
            GẦN ĐÂY
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "contacts" && styles.activeTabButton]}
          onPress={() => setActiveTab("contacts")}
        >
          <Text style={[styles.tabText, activeTab === "contacts" && styles.activeTabText]}>
            DANH BẠ
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contacts List */}
      <FlatList
        data={filteredContacts()}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
      />
      
      {/* Create Group Button (only show when contacts are selected) */}
      {selectedContacts.length > 0 && (
        <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
          <Text style={styles.createGroupButtonText}>Tạo nhóm</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  selectedCount: {
    color: "#888888",
    fontSize: 14,
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  groupAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  groupNameInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 8,
    height: 40,
  },
  keyboardNumber: {
    color: "#888888",
    fontSize: 14,
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 4,
  },
  lastActive: {
    color: "#888888",
    fontSize: 14,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#888888",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0084FF",
    borderColor: "#0084FF",
  },
  createGroupButton: {
    backgroundColor: "#0084FF",
    paddingVertical: 12,
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  createGroupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default CreateGroupScreen
