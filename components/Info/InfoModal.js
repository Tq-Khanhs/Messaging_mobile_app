import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Modal, 
  ScrollView, 
  FlatList,
  Switch 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InfoModal = ({ contact, visible, onClose }) => {
  const [isCloseFriend, setIsCloseFriend] = useState(false);

  // Sample shared media
  const sharedMedia = [
    { id: 1, type: 'image', url: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, type: 'image', url: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 3, type: 'image', url: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, type: 'image', url: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 5, type: 'image', url: 'https://randomuser.me/api/portraits/men/5.jpg' },
  ];

  const renderSharedMediaItem = ({ item }) => (
    <Image 
      source={{ uri: item.url }} 
      style={styles.sharedMediaItem} 
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.infoModalContainer}>
        {/* Header */}
        <View style={styles.infoHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.infoHeaderTitle}>Tùy chọn</Text>
        </View>

        <ScrollView style={styles.infoContent}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: contact?.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }}
              style={styles.profileAvatar}
            />
            <Text style={styles.profileName}>{contact?.name || "Nguyễn Minh Đức"}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="search" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Tìm tin nhắn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="person" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Trang cá nhân</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="wallpaper" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Đổi hình nền</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Icon name="notifications-off" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Tắt thông báo</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Options */}
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="edit" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Đổi tên gọi nhớ</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="star" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Đánh dấu bạn thân</Text>
              </View>
              <Switch
                value={isCloseFriend}
                onValueChange={setIsCloseFriend}
                trackColor={{ false: "#333", true: "#0084FF" }}
                thumbColor={isCloseFriend ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="history" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Nhật ký chung</Text>
              </View>
            </TouchableOpacity>

            {/* Shared Media */}
            <View style={styles.sharedMediaSection}>
              <View style={styles.settingLeft}>
                <Icon name="photo-library" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Ảnh, file, link</Text>
              </View>
              
              <FlatList
                data={sharedMedia}
                renderItem={renderSharedMediaItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                style={styles.sharedMediaList}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="group-add" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Tạo nhóm với {contact?.name || "Nguyễn Minh Đức"}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="person-add" size={24} color="#AAAAAA" />
                <Text style={styles.settingText}>Thêm {contact?.name || "Nguyễn Minh Đức"} vào nhóm</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, styles.dangerItem]}>
              <View style={styles.settingLeft}>
                <Icon name="block" size={24} color="#F44336" />
                <Text style={styles.dangerText}>Xem chặn</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  infoModalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  infoHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  infoContent: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  settingsContainer: {
    paddingTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
  },
  dangerItem: {
    marginTop: 10,
  },
  dangerText: {
    color: '#F44336',
    fontSize: 16,
    marginLeft: 15,
  },
  sharedMediaSection: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  sharedMediaList: {
    marginTop: 15,
    height: 100,
  },
  sharedMediaItem: {
    width: 90,
    height: 90,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#2D2D2D',
  },
});

export default InfoModal;