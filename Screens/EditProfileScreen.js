import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  TouchableWithoutFeedback,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation = {} }) => {
  
    const [username, setUsername] = useState('Nguyễn Minh Đức');
    const [bio, setBio] = useState('Không có gì quý hơn Độc lập, Tự do');
    
    const [dateOfBirth, setDateOfBirth] = useState('99/99/9999');
    const [address, setAddress] = useState('thành phố Hồ Chí Minh');
    
 
  const [avatar, setAvatar] = useState(require('../assets/icon.png'));
  const [cover, setCover] = useState(require('../assets/favicon.png')); // thêm ảnh mặc định
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null); // 'avatar' | 'cover'
  
  
  const handleSave = () => {
    navigation.goBack?.();
  };

  const handleImagePick = async () => {
    setModalVisible(false); // 👉 Tắt modal ngay lập tức
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      const file = result.assets[0];
      const { uri } = file;
  
      const isValid = /\.(jpg|jpeg|png|gif)$/i.test(uri);
      if (!isValid) {
        Alert.alert('Lỗi', 'Chỉ chấp nhận tệp hình ảnh (.jpg, .jpeg, .png, .gif)');
        return;
      }
  
      if (editingType === 'avatar') {
        setAvatar({ uri });
      } else if (editingType === 'cover') {
        setCover({ uri });
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack?.()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ảnh bìa */}
        <TouchableOpacity
          onPress={() => {
            setEditingType('cover');
            setModalVisible(true);
          }}
        >
          <Image source={cover} style={styles.coverImage} />
          <View style={styles.coverCameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => {
            setEditingType('avatar');
            setModalVisible(true);
          }}
        >
          <Image source={avatar} style={styles.avatar} />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Form input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nhập tên"
          />

          <Text style={styles.label}>Giới thiệu</Text>
          <TextInput
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            placeholder="Viết gì đó..."
          />

          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />

          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập địa chỉ của bạn..."
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn ảnh */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn ảnh từ thư viện</Text>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleImagePick}
                >
                  <Text style={styles.modalButtonText}>Chọn ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: 'red', marginTop: 12 }}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  coverCameraIcon: {
    position: 'absolute',
    right: 20,
    bottom: 10,
    backgroundColor: '#0068FF',
    padding: 6,
    borderRadius: 14,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0068FF',
    borderRadius: 12,
    padding: 4,
  },
  inputGroup: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#0068FF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0068FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
