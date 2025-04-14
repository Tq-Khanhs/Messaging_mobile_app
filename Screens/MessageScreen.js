import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';


const conversations = [
  {
    id: '1',
    name: 'Nhóm 8 TTĐT_TH(1-3)',
    avatar: require('../assets/icon.png'),
    lastMessage: 'Phạm Hoàng Phi: [Hình ảnh]',
    time: '10 phút',
    memberCount: 5,
    isGroup: true,
  },
  {
    id: '2',
    name: 'Media Box',
    avatar: require('../assets/icon.png'),
    lastMessage: 'Báo Mới: Người lính cứu hỏa kể lại phút vượt khói...',
    time: '',
    isOfficial: true,
    hasNotification: true,
  },
  {
    id: '3',
    name: 'Hoàng Phú IELTS Fighter',
    avatar: require('../assets/icon.png'),
    lastMessage: '[Hình ảnh]',
    time: '2 giờ',
  }
];

const MessagesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('priority');

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('ChatDetail', { conversation: item })}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          <>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.memberCountBadge}>
              <Text style={styles.memberCountText}>{item.memberCount}</Text>
            </View>
          </>
        ) : (
          <Image source={item.avatar} style={styles.avatar} />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isOfficial && (
              <View style={styles.officialBadge}>
                <MaterialIcons name="verified" size={14} color="#FFD700" />
              </View>
            )}
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.hasNotification && (
            <View style={styles.notificationDot} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />


      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
          />

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="qr-code" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'priority' && styles.activeTab]}
          onPress={() => setActiveTab('priority')}
        >
          <Text style={[styles.tabText, activeTab === 'priority' && styles.activeTabText]}>
            Ưu tiên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'other' && styles.activeTab]}
          onPress={() => setActiveTab('other')}
        >
          <Text style={[styles.tabText, activeTab === 'other' && styles.activeTabText]}>
            Khác
          </Text>
        </TouchableOpacity>
        <View style={styles.tabSpacer} />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#888" />
        </TouchableOpacity>
      </View>


      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} >
          <Ionicons name="chatbubble-outline" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Tin Nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ContactsScreen")}>
          <Ionicons name="people" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#888" onPress={() => navigation.navigate("ProfileScreen")}  />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: "100%"
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    width: 400

  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
  },
  headerButton: {
    marginLeft: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '500',
  },
  tabSpacer: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberCountBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  memberCountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conversationName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  officialBadge: {
    marginLeft: 4,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessageText: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#0068FF',
  },
  activeNavText: {
    color: '#0068FF',
    fontSize: 12,
    marginTop: 2,
  },
});
export default MessagesScreen;