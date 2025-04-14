import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

const MoreActions = ({ onSendImage, onSendVideo, onSendDocument, onSendLocation }) => {
  // Handle image selection
  const handleImagePicker = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Cần quyền truy cập thư viện ảnh để thực hiện chức năng này!');
          return;
        }
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSendImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Có lỗi xảy ra khi chọn ảnh!');
    }
  };
  
  // Handle video selection
  const handleVideoPicker = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Cần quyền truy cập thư viện ảnh để thực hiện chức năng này!');
          return;
        }
      }
      
      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSendVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      alert('Có lỗi xảy ra khi chọn video!');
    }
  };
  
  // Handle document selection
  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        onSendDocument(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Có lỗi xảy ra khi chọn tài liệu!');
    }
  };
  
  // Handle location sharing
  const handleLocationPicker = async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập vị trí để thực hiện chức năng này!');
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      onSendLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Có lỗi xảy ra khi lấy vị trí!');
    }
  };

  return (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={handleImagePicker}
      >
        <View style={[styles.attachmentIconContainer, {backgroundColor: '#4CAF50'}]}>
          <Icon name="image" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Hình ảnh</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={handleVideoPicker}
      >
        <View style={[styles.attachmentIconContainer, {backgroundColor: '#F44336'}]}>
          <Icon name="videocam" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Video</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={handleDocumentPicker}
      >
        <View style={[styles.attachmentIconContainer, {backgroundColor: '#2196F3'}]}>
          <Icon name="insert-drive-file" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Tài liệu</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={handleLocationPicker}
      >
        <View style={[styles.attachmentIconContainer, {backgroundColor: '#FF9800'}]}>
          <Icon name="location-on" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Vị trí</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  attachmentOptionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 15,
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  attachmentOption: {
    alignItems: 'center',
    width: 70,
  },
  attachmentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default MoreActions;