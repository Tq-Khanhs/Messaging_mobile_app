import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const MessageOptionsModal = ({ 
  visible, 
  onClose, 
  message, 
  position, 
  onDelete, 
  onReply, 
  onCopy, 
  onReact 
}) => {
  // Reaction options
  const reactions = [
    { id: 'like', icon: 'thumb-up', label: 'Thích', color: '#0084FF' },
    { id: 'love', icon: 'favorite', label: 'Yêu thích', color: '#F44336' },
    { id: 'haha', icon: 'mood', label: 'Haha', color: '#FFD700' },
    { id: 'sad', icon: 'sentiment-dissatisfied', label: 'Buồn', color: '#FFD700' },
    { id: 'angry', icon: 'sentiment-very-dissatisfied', label: 'Phẫn nộ', color: '#F44336' },
    { id: 'wow', icon: 'sentiment-satisfied-alt', label: 'Ngạc nhiên', color: '#FFD700' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Reactions Bar - Positioned at the top of the message */}
        <View style={[styles.reactionsContainer, { top: position.y - 60 }]}>
          {reactions.map((reaction) => (
            <TouchableOpacity 
              key={reaction.id}
              style={styles.reactionButton}
              onPress={() => {
                onReact(message.id, reaction.id);
                onClose();
              }}
            >
              <Icon name={reaction.icon} size={24} color={reaction.color} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Options Menu - Positioned near the message */}
        <View style={[styles.modalContainer, {
          top: position.y + 20,
          left: position.x > width / 2 ? 20 : null,
          right: position.x <= width / 2 ? 20 : null,
        }]}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              onReply(message);
              onClose();
            }}
          >
            <Icon name="reply" size={22} color="#FFFFFF" />
            <Text style={styles.optionText}>Trả lời</Text>
          </TouchableOpacity>
          
          {message && message.type === 'text' && (
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                onCopy(message.text);
                onClose();
              }}
            >
              <Icon name="content-copy" size={22} color="#FFFFFF" />
              <Text style={styles.optionText}>Sao chép</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              onDelete(message.id);
              onClose();
            }}
          >
            <Icon name="delete" size={22} color="#F44336" />
            <Text style={[styles.optionText, styles.deleteText]}>Xóa tin nhắn</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
  },
  deleteText: {
    color: '#F44336',
  },
  reactionsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    borderRadius: 30,
    padding: 8,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default MessageOptionsModal;