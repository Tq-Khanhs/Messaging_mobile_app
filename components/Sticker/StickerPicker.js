import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const StickerPicker = ({ onStickerSelect }) => {
  // Sample stickers
  const stickers = [
    { id: 'sticker1', url: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 'sticker2', url: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 'sticker3', url: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 'sticker4', url: 'https://randomuser.me/api/portraits/men/6.jpg' },
    { id: 'sticker5', url: 'https://randomuser.me/api/portraits/men/7.jpg' },
    { id: 'sticker6', url: 'https://randomuser.me/api/portraits/men/8.jpg' },
    { id: 'sticker7', url: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { id: 'sticker8', url: 'https://randomuser.me/api/portraits/men/10.jpg' },
    { id: 'sticker9', url: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { id: 'sticker10', url: 'https://randomuser.me/api/portraits/men/12.jpg' },
    { id: 'sticker11', url: 'https://randomuser.me/api/portraits/men/13.jpg' },
    { id: 'sticker12', url: 'https://randomuser.me/api/portraits/men/14.jpg' },
  ];

  // Sample sticker categories
  const stickerCategories = [
    { id: 'cat1', name: 'Mặc định', icon: 'emoji-emotions' },
    { id: 'cat2', name: 'Động vật', icon: 'pets' },
    { id: 'cat3', name: 'Thể thao', icon: 'sports-soccer' },
    { id: 'cat4', name: 'Thức ăn', icon: 'fastfood' },
    { id: 'cat5', name: 'Tình yêu', icon: 'favorite' },
  ];

  const renderStickerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.stickerItem} 
      onPress={() => onStickerSelect(item)}
    >
      <Image 
        source={{ uri: item.url }} 
        style={styles.stickerImage} 
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const renderStickerCategory = ({ item }) => (
    <TouchableOpacity style={styles.stickerCategoryItem}>
      <Icon name={item.icon} size={24} color="#AAAAAA" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.stickerPickerContainer}>
      <FlatList
        data={stickers}
        renderItem={renderStickerItem}
        keyExtractor={item => item.id}
        numColumns={4}
        style={styles.stickerGrid}
      />
      
      <View style={styles.stickerCategoriesContainer}>
        <FlatList
          data={stickerCategories}
          renderItem={renderStickerCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stickerPickerContainer: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    height: 250,
  },
  stickerGrid: {
    flex: 1,
    padding: 10,
  },
  stickerItem: {
    width: width / 4 - 10,
    height: width / 4 - 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  stickerCategoriesContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    padding: 10,
  },
  stickerCategoryItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default StickerPicker;