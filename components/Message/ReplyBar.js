import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReplyBar = ({ message, onCancel, onScrollToMessage }) => {
  if (!message) return null;
  
  // Get preview text based on message type
  const getPreviewText = () => {
    switch (message.type) {
      case 'text':
        return message.text;
      case 'sticker':
        return '[Sticker]';
      case 'voice':
        return '[Voice Message]';
      default:
        return '[Media]';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.7}
      onPress={onScrollToMessage}
    >
      <View style={styles.replyLine} />
      <View style={styles.contentContainer}>
        <Text style={styles.nameText}>
          {message.isMe ? 'Bạn' : message.sender.name}
        </Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {getPreviewText()}
        </Text>
      </View>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Icon name="close" size={20} color="#AAAAAA" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  replyLine: {
    width: 3,
    height: '100%',
    backgroundColor: '#0084FF',
    borderRadius: 1.5,
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  nameText: {
    color: '#0084FF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  cancelButton: {
    padding: 5,
  },
});

export default ReplyBar;