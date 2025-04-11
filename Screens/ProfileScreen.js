import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Switch,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const posts = [
  {
    id: '1',
    content: 'Khuyến mãi cực lớn tại Điện Máy TLC 🔥',
    image: require('../assets/favicon.png'),
  },
  {
    id: '2',
    content: 'Vừa về quạt điều hoà mới, giá rẻ bất ngờ 😍',
    image: require('../assets/favicon.png'),
  },
];



const ProfileScreen = ({ navigation }) => {
  
  const coverImage = require('../assets/favicon.png');
  const avatarImage = require('../assets/icon.png');
  
  const [username, setUsername] = useState('Nguyễn Minh Đức');
  const [bio, setBio] = useState('Không có gì quý hơn Độc lập, Tự do');
  
  const [dateOfBirth, setDateOfBirth] = useState('99/99/9999');
  const [phoneNumber, setPhoneNumber] = useState('0909 999 999');
  const [mutualGroups, setMutualGroups] = useState(2);
  const [address, setAddress] = useState('thành phố Hồ Chí Minh');
  
  const [status, setStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postText}>{item.content}</Text>
      {item.image && <Image source={item.image} style={styles.postImage} />}
    </View>
  );

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigation.navigate('Login'); // Cần đảm bảo bạn đã khai báo LoginScreen
  };
 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            {/* Cover Image */}
            {/* ảnh bìa */}
            <TouchableOpacity onPress={() => { setSelectedImage(coverImage); setImageModalVisible(true); }}>
              <Image source={coverImage} style={styles.coverImage} />
            </TouchableOpacity>

            {/* Avatar + Info */}
            <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {/* ảnh đại diện có thể nhấn */}
              <TouchableOpacity onPress={() => { setSelectedImage(avatarImage); setImageModalVisible(true); }}>

                <Image source={avatarImage} style={styles.avatar} />
                {isActive && <View style={styles.onlineDot} />}
              </TouchableOpacity>
            </View>
              {/* tên tài khoản */}
              <Text style={styles.username}>{username}</Text>
              {/* bio: giới thiệu về bản thân */}
              <Text style={styles.bio}>
                {bio}
              </Text>
            </View>

            {/* Personal Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>Ngày sinh: {dateOfBirth}</Text>
              <Text style={styles.infoText}>SĐT: {phoneNumber}</Text>
              <Text style={styles.infoText}>Nhóm chung: {mutualGroups}</Text>
              <Text style={styles.infoText}>Địa chỉ: {address}</Text>
            </View>

            {/* Status Input */}
            <View style={styles.statusBox}>
              <TextInput
                placeholder="Bạn đang nghĩ gì?"
                placeholderTextColor="#888"
                value={status}
                onChangeText={setStatus}
                style={styles.statusInput}
              />
              <TouchableOpacity style={styles.uploadButton}>
                <Ionicons name="image-outline" size={20} color="#0068FF" />
                <Text style={styles.uploadText}>Thêm ảnh</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />



      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContactsScreen')}
        >
          <Ionicons name="people" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('HistoryScreen')}
        >
          <Ionicons name="time-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="person-outline" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Hồ sơ</Text>
        </TouchableOpacity>
        
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Sửa hồ sơ */}
                <TouchableOpacity
                  onPress={() => {
                    setShowSettings(false);
                    navigation.navigate('EditProfileScreen');
                  }}
                  style={styles.modalItem}
                >
                  <Ionicons name="create-outline" size={20} color="#000" />
                  <Text style={styles.modalItemText}>Sửa hồ sơ</Text>
                </TouchableOpacity>

                {/* Bật/tắt trạng thái */}
                <TouchableOpacity
                  onPress={() => {
                    setIsActive(!isActive);
                    setShowSettings(false);
                  }}
                  style={styles.modalItem}
                >
                  <Ionicons name="power-outline" size={20} color="#000" />
                  <Text style={styles.modalItemText}>
                    {isActive ? 'Tắt' : 'Bật'} trạng thái hoạt động
                  </Text>
                </TouchableOpacity>

                {/* Đăng xuất */}
                <TouchableOpacity
                  onPress={() => {
                    setShowSettings(false);
                    setShowLogoutConfirm(true);
                  }}
                  style={styles.modalItem}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                  <Text style={[styles.modalItemText, { color: '#FF3B30' }]}>Đăng xuất</Text>
                </TouchableOpacity>

                {/* Đóng modal */}
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Text style={{ textAlign: 'center', color: 'red', marginTop: 10 }}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Logout Confirm Modal */}
      <Modal visible={showLogoutConfirm} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowLogoutConfirm(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Bạn chắc chắn muốn đăng xuất?</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={{ color: '#fff' }}>Đăng xuất</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLogoutConfirm(false)}>
                  <Text style={{ textAlign: 'center', color: 'red', marginTop: 10 }}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.fullscreenImageContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={selectedImage} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  scrollContent: { paddingBottom: 100 },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  coverImage: { width: '100%', height: 150 },
  profileHeader: { alignItems: 'center', marginTop: -40 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#ccc',
  },
  onlineDot: {
    width: 14,
    height: 14,
    backgroundColor: '#00FF00',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  username: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  bio: { fontSize: 14, color: '#ccc', textAlign: 'center', paddingHorizontal: 20 },
  infoSection: {
    padding: 16,
    backgroundColor: '#2A2A2A',
    marginBottom: 12,
  },
  infoText: { color: '#eee', marginBottom: 6 },
  statusBox: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    marginBottom: 12,
  },
  statusInput: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    color: '#fff',
    marginBottom: 10,
  },
  uploadButton: { flexDirection: 'row', alignItems: 'center' },
  uploadText: {
    marginLeft: 8,
    color: '#0068FF',
    fontWeight: 'bold',
  },
  postList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  postText: { fontSize: 15, color: '#fff', marginBottom: 6 },
  postImage: { width: '100%', height: 200, borderRadius: 6, marginTop: 6 },
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  logoutBtn: {
    backgroundColor: '#0068FF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  
});

export default ProfileScreen;
