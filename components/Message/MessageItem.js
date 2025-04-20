import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatRecordingTime } from '../../utils/timeUtils';

const MessageItem = ({ message, onPress }) => {
  // Determine bubble style based on position in sequence
  const getBubbleStyle = () => {
    if (message.isMe) {
      if (message.isFirstInSequence && message.isLastInSequence) {
        return styles.singleMyBubble;
      } else if (message.isFirstInSequence) {
        return styles.firstMyBubble;
      } else if (message.isLastInSequence) {
        return styles.lastMyBubble;
      } else {
        return styles.middleMyBubble;
      }
    } else {
      if (message.isFirstInSequence && message.isLastInSequence) {
        return styles.singleTheirBubble;
      } else if (message.isFirstInSequence) {
        return styles.firstTheirBubble;
      } else if (message.isLastInSequence) {
        return styles.lastTheirBubble;
      } else {
        return styles.middleTheirBubble;
      }
    }
  };

  // Render different message types
  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <Text style={message.isMe ? styles.myText : styles.theirText}>
            {message.text}
          </Text>
        );
      case 'sticker':
        return (
          <Image 
            source={{ uri: message.stickerUrl }} 
            style={styles.stickerImage} 
            resizeMode="contain"
          />
        );
      case 'voice':
        return (
          <View style={styles.voiceMessageContainer}>
            <Icon name="play-arrow" size={24} color={message.isMe ? "#FFFFFF" : "#EEEEEE"} />
            <View style={styles.voiceWaveContainer}>
              <View style={styles.voiceWave} />
            </View>
            <Text style={message.isMe ? styles.myText : styles.theirText}>
              {formatRecordingTime(message.voiceDuration)}
            </Text>
          </View>
        );
      default:
        return (
          <Text style={message.isMe ? styles.myText : styles.theirText}>
            {message.text || "Tin nhắn không hỗ trợ"}
          </Text>
        );
    }
  };
  
  return (
    <View style={[
      styles.messageWrapper,
      message.isFirstInSequence && styles.firstInSequenceWrapper
    ]}>
      {/* Time indicator - only show if needed based on rules */}
      {message.showTime && (
        <View style={styles.timeIndicator}>
          <Text style={styles.timeIndicatorText}>{message.formattedTime}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.messageContainer, 
          message.isMe ? styles.myMessage : styles.theirMessage,
          message.type === 'sticker' && styles.stickerMessageContainer
        ]}
      >
        {/* Avatar or placeholder for alignment */}
        {!message.isMe ? (
          message.isFirstInSequence ? (
            <Image
              source={{ uri: message.sender.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )
        ) : null}
        
        {/* Message bubble */}
        <View style={[
          styles.messageBubble,
          message.isMe ? styles.myBubble : styles.theirBubble,
          getBubbleStyle(),
          message.type === 'sticker' && styles.stickerBubble
        ]}>
          {renderMessageContent()}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 2,
  },
  firstInSequenceWrapper: {
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  stickerMessageContainer: {
    alignItems: 'center',
  },
  myMessage: {
    justifyContent: 'flex-end',
    paddingLeft: 36, // Add padding to align with other messages
  },
  theirMessage: {
    justifyContent: 'flex-start',
    marginRight: 50, // Give space on the right for their messages
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    paddingHorizontal: 12,
  },
  stickerBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  stickerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  // My message bubbles (blue)
  myBubble: {
    backgroundColor: '#0084FF',
  },
  singleMyBubble: {
    borderRadius: 18,
  },
  firstMyBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    marginBottom: 1,
  },
  middleMyBubble: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginVertical: 1,
  },
  lastMyBubble: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    marginTop: 1,
  },
  // Their message bubbles (gray)
  theirBubble: {
    backgroundColor: '#2D2D2D',
  },
  singleTheirBubble: {
    borderRadius: 18,
  },
  firstTheirBubble: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    marginBottom: 1,
  },
  middleTheirBubble: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    marginVertical: 1,
  },
  lastTheirBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: 1,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#EEEEEE',
  },
  timeIndicator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeIndicatorText: {
    fontSize: 12,
    color: '#AAAAAA',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceWaveContainer: {
    marginHorizontal: 10,
  },
  voiceWave: {
    width: 100,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
});

export default MessageItem;