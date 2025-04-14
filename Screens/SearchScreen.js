import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("khanh0kun@gmail.com")

  const clearSearch = () => {
    setSearchQuery("")
  }

  const contactResults = [
    {
      id: "1",
      name: "Trần Quốc Khánh",
      email: "khanh0kun@gmail.com",
      avatar: null,
      initials: "TK",
      avatarColor: "#FF6B6B",
    },
  ]

  const renderContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View style={[styles.initialsAvatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.initialsText}>{item.initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>Email: {item.email}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>KẾT BẠN</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <View style={styles.clearButtonCircle}>
                <Ionicons name="close" size={16} color="#888" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.qrButton}>
          <Ionicons name="qr-code" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tìm bạn qua email</Text>
        </View>
        <FlatList
          data={contactResults}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
  },
  qrButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  initialsAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  contactPhone: {
    color: "#888888",
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#0068FF",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default SearchScreen
