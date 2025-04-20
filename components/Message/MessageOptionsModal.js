import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const reactions = [
  { id: 'like', icon: 'thumb-up', label: 'Thích', color: '#0084FF' },
  { id: 'love', icon: 'favorite', label: 'Yêu thích', color: '#F44336' },
  { id: 'haha', icon: 'mood', label: 'Haha', color: '#FFD700' },
  { id: 'sad', icon: 'sentiment-dissatisfied', label: 'Buồn', color: '#FFD700' },
  { id: 'angry', icon: 'sentiment-very-dissatisfied', label: 'Phẫn nộ', color: '#F44336' },
  { id: 'wow', icon: 'sentiment-satisfied-alt', label: 'Ngạc nhiên', color: '#FFD700' },
];

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
  const getModalPosition = () => {
    const modalHeight = 200;
    const top = Math.min(position?.y || 0, height - modalHeight - 50);

    return {
      top,
      left: (position?.x || 0) > width / 2 ? 20 : null,
      right: (position?.x || 0) <= width / 2 ? 20 : null,
    };
  };

  const handleReaction = (reactionId) => {
    if (message && onReact) {
      onReact(message.id, reactionId);
    }
    onClose?.();
  };

  const handleReply = () => {
    if (message && onReply) {
      onReply(message);
    }
    onClose?.();
  };

  const handleCopy = () => {
    if (message?.text && onCopy) {
      onCopy(message.text);
    }
    onClose?.();
  };

  const handleDelete = () => {
    if (message && onDelete) {
      onDelete(message.id);
    }
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Reactions Bar */}
        {message && (
          <View style={[styles.reactionsContainer, { top: (position?.y || 0) - 60 }]}>
            {reactions.map((reaction) => (
              <TouchableOpacity
                key={reaction.id}
                style={styles.reactionButton}
                onPress={() => handleReaction(reaction.id)}
              >
                <Icon name={reaction.icon} size={24} color={reaction.color} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Options Menu */}
        <View style={[styles.modalContainer, getModalPosition()]}>
          <TouchableOpacity style={styles.optionItem} onPress={handleReply}>
            <Icon name="reply" size={22} color="#FFFFFF" />
            <Text style={styles.optionText}>Trả lời</Text>
          </TouchableOpacity>

          {message?.type === 'text' && (
            <TouchableOpacity style={styles.optionItem} onPress={handleCopy}>
              <Icon name="content-copy" size={22} color="#FFFFFF" />
              <Text style={styles.optionText}>Sao chép</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reactionsContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    elevation: 5,
  },
  reactionButton: {
    padding: 8,
  },
  modalContainer: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  deleteText: {
    color: '#F44336',
  },
});

export default MessageOptionsModal;
