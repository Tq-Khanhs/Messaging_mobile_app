
// import React, { useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image,
//   Animated,
//   PanResponder
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const MessageItem = ({ 
//   message, 
//   onPress, 
//   onLongPress, 
//   onSwipeToReply
// }) => {
//   // Animation value for swipe
//   const swipeAnim = useRef(new Animated.Value(0)).current;
  
//   // Pan responder for swipe gestures
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         // Only respond to horizontal movements
//         return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
//       },
//       onPanResponderMove: (_, gestureState) => {
//         // Only allow swiping right for their messages and left for my messages
//         if ((!message.isMe && gestureState.dx > 0) || (message.isMe && gestureState.dx < 0)) {
//           // Limit the swipe distance
//           const newValue = Math.min(Math.abs(gestureState.dx), 80) * (gestureState.dx < 0 ? -1 : 1);
//           swipeAnim.setValue(newValue);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         // If swiped far enough, trigger reply
//         if (Math.abs(gestureState.dx) > 60) {
//           onSwipeToReply(message);
//         }
        
//         // Reset position
//         Animated.spring(swipeAnim, {
//           toValue: 0,
//           useNativeDriver: true,
//         }).start();
//       },
//     })
//   ).current;

//   // Determine bubble style based on position in sequence
//   const getBubbleStyle = () => {
//     if (message.isMe) {
//       if (message.isFirstInSequence && message.isLastInSequence) {
//         return styles.singleMyBubble;
//       } else if (message.isFirstInSequence) {
//         return styles.firstMyBubble;
//       } else if (message.isLastInSequence) {
//         return styles.lastMyBubble;
//       } else {
//         return styles.middleMyBubble;
//       }
//     } else {
//       if (message.isFirstInSequence && message.isLastInSequence) {
//         return styles.singleTheirBubble;
//       } else if (message.isFirstInSequence) {
//         return styles.firstTheirBubble;
//       } else if (message.isLastInSequence) {
//         return styles.lastTheirBubble;
//       } else {
//         return styles.middleTheirBubble;
//       }
//     }
//   };

//   // Render different message types
//   const renderMessageContent = () => {
//     switch (message.type) {
//       case 'text':
//         return (
//           <Text style={message.isMe ? styles.myText : styles.theirText}>
//             {message.text}
//           </Text>
//         );
//       case 'sticker':
//         return (
//           <Image 
//             source={{ uri: message.stickerUrl }} 
//             style={styles.stickerImage} 
//             resizeMode="contain"
//           />
//         );
//       case 'voice':
//         return (
//           <View style={styles.voiceMessageContainer}>
//             <Icon name="play-arrow" size={24} color={message.isMe ? "#FFFFFF" : "#EEEEEE"} />
//             <View style={styles.voiceWaveContainer}>
//               <View style={styles.voiceWave} />
//             </View>
//             <Text style={message.isMe ? styles.myText : styles.theirText}>
//               {message.voiceDuration ? `${message.voiceDuration}s` : "0:00"}
//             </Text>
//           </View>
//         );
//       case 'image':
//         return (
//           <Image 
//             source={{ uri: message.imageUri }} 
//             style={styles.imageMessage} 
//             resizeMode="cover"
//           />
//         );
//       default:
//         return (
//           <Text style={message.isMe ? styles.myText : styles.theirText}>
//             {message.text || "Tin nhắn không hỗ trợ"}
//           </Text>
//         );
//     }
//   };

//   // Truncate text to first 10 characters + "..."
//   const truncateText = (text) => {
//     if (!text) return "";
//     return text.length > 10 ? text.substring(0, 10) + '...' : text;
//   };

//   // Render reply content if this message is a reply
//   const renderReplyContent = () => {
//     if (!message.replyTo) return null;
    
//     // Get preview text based on message type
//     let previewText = "";
//     switch (message.replyTo.type) {
//       case 'text':
//         previewText = truncateText(message.replyTo.text);
//         break;
//       case 'sticker':
//         previewText = '[Sticker]';
//         break;
//       case 'voice':
//         previewText = '[Voice Message]';
//         break;
//       case 'image':
//         previewText = '[Hình ảnh]';
//         break;
//       default:
//         previewText = '[Media]';
//     }
    
//     return (
//       <View style={[
//         styles.replyContainer, 
//         message.isMe ? styles.myReplyContainer : styles.theirReplyContainer
//       ]}>
//         <View style={styles.replyLine} />
//         <View style={styles.replyContent}>
//           <Text style={styles.replyName}>
//             {message.replyTo.isMe ? 'Bạn' : message.replyTo.sender.name}
//           </Text>
//           <Text style={styles.replyText} numberOfLines={1}>
//             {previewText}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   // Render reaction icon if any
//   const renderReaction = () => {
//     if (!message.reaction) return null;
    
//     let iconName = 'thumb-up';
//     let iconColor = '#0084FF';
    
//     switch (message.reaction) {
//       case 'love':
//         iconName = 'favorite';
//         iconColor = '#F44336';
//         break;
//       case 'haha':
//         iconName = 'mood';
//         iconColor = '#FFD700';
//         break;
//       case 'sad':
//         iconName = 'sentiment-dissatisfied';
//         iconColor = '#FFD700';
//         break;
//       case 'angry':
//         iconName = 'sentiment-very-dissatisfied';
//         iconColor = '#F44336';
//         break;
//       case 'wow':
//         iconName = 'sentiment-satisfied-alt';
//         iconColor = '#FFD700';
//         break;
//     }
    
//     return (
//       <View style={[
//         styles.reactionContainer,
//         message.isMe ? styles.myReactionContainer : styles.theirReactionContainer
//       ]}>
//         <Icon name={iconName} size={16} color={iconColor} />
//       </View>
//     );
//   };
  
//   return (
//     <View style={[
//       styles.messageWrapper,
//       message.isFirstInSequence && styles.firstInSequenceWrapper
//     ]}>
//       {/* Time indicator - only show if needed based on rules */}
//       {message.showTime && (
//         <View style={styles.timeIndicator}>
//           <Text style={styles.timeIndicatorText}>{message.formattedTime}</Text>
//         </View>
//       )}
      
//       <Animated.View 
//         style={[
//           styles.messageContainer, 
//           message.isMe ? styles.myMessage : styles.theirMessage,
//           { transform: [{ translateX: swipeAnim }] }
//         ]}
//         {...panResponder.panHandlers}
//       >
//         {/* Reply indicator */}
//         {message.isMe ? (
//           <Animated.View style={[
//             styles.replyIndicator,
//             styles.myReplyIndicator,
//             {
//               opacity: swipeAnim.interpolate({
//                 inputRange: [-80, 0],
//                 outputRange: [1, 0],
//                 extrapolate: 'clamp',
//               }),
//               transform: [{
//                 translateX: swipeAnim.interpolate({
//                   inputRange: [-80, 0],
//                   outputRange: [-20, 0],
//                   extrapolate: 'clamp',
//                 })
//               }]
//             }
//           ]}>
//             <Icon name="reply" size={20} color="#FFFFFF" />
//           </Animated.View>
//         ) : (
//           <Animated.View style={[
//             styles.replyIndicator,
//             styles.theirReplyIndicator,
//             {
//               opacity: swipeAnim.interpolate({
//                 inputRange: [0, 80],
//                 outputRange: [0, 1],
//                 extrapolate: 'clamp',
//               }),
//               transform: [{
//                 translateX: swipeAnim.interpolate({
//                   inputRange: [0, 80],
//                   outputRange: [0, 20],
//                   extrapolate: 'clamp',
//                 })
//               }]
//             }
//           ]}>
//             <Icon name="reply" size={20} color="#FFFFFF" />
//           </Animated.View>
//         )}
        
//         {/* Avatar or placeholder for alignment */}
//         {!message.isMe ? (
//           message.isFirstInSequence ? (
//             <Image
//               source={{ uri: message.sender.avatar }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={styles.avatarPlaceholder} />
//           )
//         ) : null}
        
//         {/* Message bubble */}
//         <TouchableOpacity 
//           activeOpacity={0.8}
//           onPress={() => onPress(message.id)}
//           onLongPress={(event) => {
//             // Get the position of the message for the context menu
//             event.target.measure((x, y, width, height, pageX, pageY) => {
//               onLongPress(message, { x: pageX, y: pageY, width, height });
//             });
//           }}
//           delayLongPress={200}
//         >
//           <View style={[
//             styles.messageBubble,
//             message.isMe ? styles.myBubble : styles.theirBubble,
//             getBubbleStyle(),
//             message.type === 'sticker' && styles.stickerBubble,
//             message.type === 'image' && styles.imageBubble
//           ]}>
//             {/* Reply content if this is a reply */}
//             {renderReplyContent()}
            
//             {/* Message content */}
//             {renderMessageContent()}
//           </View>
          
//           {/* Reaction */}
//           {renderReaction()}
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   messageWrapper: {
//     marginBottom: 2,
//   },
//   firstInSequenceWrapper: {
//     marginTop: 8,
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginBottom: 2,
//   },
//   myMessage: {
//     justifyContent: 'flex-end',
//     marginLeft: 50, // Add padding to align with other messages
//   },
//   theirMessage: {
//     justifyContent: 'flex-start',
//     marginRight: 50, // Give space on the right for their messages
//   },
//   avatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   avatarPlaceholder: {
//     width: 28,
//     height: 28,
//     marginRight: 8,
//   },
//   messageBubble: {
//     maxWidth: '100%',
//     padding: 10,
//     paddingHorizontal: 12,
//   },
//   stickerBubble: {
//     backgroundColor: 'transparent',
//     padding: 0,
//   },
//   imageBubble: {
//     padding: 0,
//     overflow: 'hidden',
//     borderRadius: 12,
//   },
//   stickerImage: {
//     width: 100,
//     height: 100,
//   },
//   imageMessage: {
//     width: 200,
//     height: 150,
//     borderRadius: 12,
//   },
//   // My message bubbles (blue)
//   myBubble: {
//     backgroundColor: '#0084FF',
//   },
//   singleMyBubble: {
//     borderRadius: 18,
//   },
//   firstMyBubble: {
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     borderBottomLeftRadius: 18,
//     borderBottomRightRadius: 4,
//     marginBottom: 1,
//   },
//   middleMyBubble: {
//     borderTopLeftRadius: 18,
//     borderBottomLeftRadius: 18,
//     borderTopRightRadius: 4,
//     borderBottomRightRadius: 4,
//     marginVertical: 1,
//   },
//   lastMyBubble: {
//     borderTopLeftRadius: 18,
//     borderBottomLeftRadius: 18,
//     borderTopRightRadius: 4,
//     borderBottomRightRadius: 18,
//     marginTop: 1,
//   },
//   // Their message bubbles (gray)
//   theirBubble: {
//     backgroundColor: '#2D2D2D',
//   },
//   singleTheirBubble: {
//     borderRadius: 18,
//   },
//   firstTheirBubble: {
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     borderBottomLeftRadius: 4,
//     borderBottomRightRadius: 18,
//     marginBottom: 1,
//   },
//   middleTheirBubble: {
//     borderTopLeftRadius: 4,
//     borderBottomLeftRadius: 4,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     marginVertical: 1,
//   },
//   lastTheirBubble: {
//     borderTopLeftRadius: 4,
//     borderTopRightRadius: 18,
//     borderBottomLeftRadius: 18,
//     borderBottomRightRadius: 18,
//     marginTop: 1,
//   },
//   myText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
//   theirText: {
//     color: '#EEEEEE',
//     fontSize: 16,
//   },
//   timeIndicator: {
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   timeIndicatorText: {
//     fontSize: 12,
//     color: '#AAAAAA',
//     backgroundColor: 'rgba(30, 30, 30, 0.7)',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   voiceMessageContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   voiceWaveContainer: {
//     marginHorizontal: 10,
//   },
//   voiceWave: {
//     width: 100,
//     height: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 10,
//   },
//   // Reply indicator styles
//   replyIndicator: {
//     position: 'absolute',
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: 'rgba(0, 132, 255, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   myReplyIndicator: {
//     left: -15,
//   },
//   theirReplyIndicator: {
//     right: -15,
//   },
//   // Reply content styles
//   replyContainer: {
//     flexDirection: 'row',
//     marginBottom: 5,
//     paddingBottom: 5,
//     borderBottomWidth: 1,
//     width: '100%',
//   },
//   myReplyContainer: {
//     borderBottomColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   theirReplyContainer: {
//     borderBottomColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   replyLine: {
//     width: 2,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     marginRight: 8,
//   },
//   replyContent: {
//     flex: 1,
//   },
//   replyName: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   replyText: {
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontSize: 12,
//   },
//   // Reaction styles
//   reactionContainer: {
//     position: 'absolute',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   myReactionContainer: {
//     bottom: -8,
//     right: 5,
//   },
//   theirReactionContainer: {
//     bottom: -8,
//     left: 5,
//   },
// });

// export default MessageItem;

"use client"

import { useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, PanResponder } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const MessageItem = ({ message, onPress, onLongPress, onSwipeToReply, isGroupChat = false }) => {
  // Animation value for swipe
  const swipeAnim = useRef(new Animated.Value(0)).current

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movements
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3)
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping right for their messages and left for my messages
        if ((!message.isMe && gestureState.dx > 0) || (message.isMe && gestureState.dx < 0)) {
          // Limit the swipe distance
          const newValue = Math.min(Math.abs(gestureState.dx), 80) * (gestureState.dx < 0 ? -1 : 1)
          swipeAnim.setValue(newValue)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped far enough, trigger reply
        if (Math.abs(gestureState.dx) > 60) {
          onSwipeToReply(message)
        }

        // Reset position
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  // Determine bubble style based on position in sequence
  const getBubbleStyle = () => {
    if (message.isMe) {
      if (message.isFirstInSequence && message.isLastInSequence) {
        return styles.singleMyBubble
      } else if (message.isFirstInSequence) {
        return styles.firstMyBubble
      } else if (message.isLastInSequence) {
        return styles.lastMyBubble
      } else {
        return styles.middleMyBubble
      }
    } else {
      if (message.isFirstInSequence && message.isLastInSequence) {
        return styles.singleTheirBubble
      } else if (message.isFirstInSequence) {
        return styles.firstTheirBubble
      } else if (message.isLastInSequence) {
        return styles.lastTheirBubble
      } else {
        return styles.middleTheirBubble
      }
    }
  }

  // Render different message types
  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        // Check if the message has mentions
        if (message.mentions && message.mentions.length > 0) {
          // Split the text by mentions
          const parts = []
          let lastIndex = 0

          message.mentions.forEach((mention) => {
            // Add text before the mention
            if (mention.startIndex > lastIndex) {
              parts.push({
                type: "text",
                content: message.text.substring(lastIndex, mention.startIndex),
              })
            }

            // Add the mention
            parts.push({
              type: "mention",
              content: message.text.substring(mention.startIndex, mention.endIndex),
              userId: mention.id,
              name: mention.name,
            })

            lastIndex = mention.endIndex
          })

          // Add any remaining text after the last mention
          if (lastIndex < message.text.length) {
            parts.push({
              type: "text",
              content: message.text.substring(lastIndex),
            })
          }

          // Render the parts
          return (
            <Text style={message.isMe ? styles.myText : styles.theirText}>
              {parts.map((part, index) => {
                if (part.type === "mention") {
                  return (
                    <Text key={index} style={styles.mentionText}>
                      {part.content}
                    </Text>
                  )
                } else {
                  return <Text key={index}>{part.content}</Text>
                }
              })}
            </Text>
          )
        } else {
          return <Text style={message.isMe ? styles.myText : styles.theirText}>{message.text}</Text>
        }
      case "sticker":
        return <Image source={{ uri: message.stickerUrl }} style={styles.stickerImage} resizeMode="contain" />
      case "voice":
        return (
          <View style={styles.voiceMessageContainer}>
            <Icon name="play-arrow" size={24} color={message.isMe ? "#FFFFFF" : "#EEEEEE"} />
            <View style={styles.voiceWaveContainer}>
              <View style={styles.voiceWave} />
            </View>
            <Text style={message.isMe ? styles.myText : styles.theirText}>
              {message.voiceDuration ? `${message.voiceDuration}s` : "0:00"}
            </Text>
          </View>
        )
      case "image":
        return <Image source={{ uri: message.imageUri }} style={styles.imageMessage} resizeMode="cover" />
      default:
        return (
          <Text style={message.isMe ? styles.myText : styles.theirText}>{message.text || "Tin nhắn không hỗ trợ"}</Text>
        )
    }
  }

  // Truncate text to first 10 characters + "..."
  const truncateText = (text) => {
    if (!text) return ""
    return text.length > 10 ? text.substring(0, 10) + "..." : text
  }

  // Render reply content if this message is a reply
  const renderReplyContent = () => {
    if (!message.replyTo) return null

    // Get preview text based on message type
    let previewText = ""
    switch (message.replyTo.type) {
      case "text":
        previewText = truncateText(message.replyTo.text)
        break
      case "sticker":
        previewText = "[Sticker]"
        break
      case "voice":
        previewText = "[Voice Message]"
        break
      case "image":
        previewText = "[Hình ảnh]"
        break
      default:
        previewText = "[Media]"
    }

    return (
      <View style={[styles.replyContainer, message.isMe ? styles.myReplyContainer : styles.theirReplyContainer]}>
        <View style={styles.replyLine} />
        <View style={styles.replyContent}>
          <Text style={styles.replyName}>{message.replyTo.isMe ? "Bạn" : message.replyTo.sender.name}</Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {previewText}
          </Text>
        </View>
      </View>
    )
  }

  // Render reaction icon if any
  const renderReaction = () => {
    if (!message.reaction) return null

    let iconName = "thumb-up"
    let iconColor = "#0084FF"

    switch (message.reaction) {
      case "love":
        iconName = "favorite"
        iconColor = "#F44336"
        break
      case "haha":
        iconName = "mood"
        iconColor = "#FFD700"
        break
      case "sad":
        iconName = "sentiment-dissatisfied"
        iconColor = "#FFD700"
        break
      case "angry":
        iconName = "sentiment-very-dissatisfied"
        iconColor = "#F44336"
        break
      case "wow":
        iconName = "sentiment-satisfied-alt"
        iconColor = "#FFD700"
        break
    }

    return (
      <View
        style={[styles.reactionContainer, message.isMe ? styles.myReactionContainer : styles.theirReactionContainer]}
      >
        <Icon name={iconName} size={16} color={iconColor} />
        {message.reactionCount > 0 && <Text style={styles.reactionCount}>{message.reactionCount}</Text>}
      </View>
    )
  }

  return (
    <View style={[styles.messageWrapper, message.isFirstInSequence && styles.firstInSequenceWrapper]}>
      {/* Time indicator - only show if needed based on rules */}
      {message.showTime && (
        <View style={styles.timeIndicator}>
          <Text style={styles.timeIndicatorText}>{message.formattedTime}</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.messageContainer,
          message.isMe ? styles.myMessage : styles.theirMessage,
          { transform: [{ translateX: swipeAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Reply indicator */}
        {message.isMe ? (
          <Animated.View
            style={[
              styles.replyIndicator,
              styles.myReplyIndicator,
              {
                opacity: swipeAnim.interpolate({
                  inputRange: [-80, 0],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateX: swipeAnim.interpolate({
                      inputRange: [-80, 0],
                      outputRange: [-20, 0],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="reply" size={20} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.replyIndicator,
              styles.theirReplyIndicator,
              {
                opacity: swipeAnim.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateX: swipeAnim.interpolate({
                      inputRange: [0, 80],
                      outputRange: [0, 20],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name="reply" size={20} color="#FFFFFF" />
          </Animated.View>
        )}

        {/* Avatar or placeholder for alignment */}
        {!message.isMe ? (
          message.isFirstInSequence ? (
            <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )
        ) : null}

        {/* Message bubble */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPress(message.id)}
          onLongPress={(event) => {
            // Get the position of the message for the context menu
            event.target.measure((x, y, width, height, pageX, pageY) => {
              onLongPress(message, { x: pageX, y: pageY, width, height })
            })
          }}
          delayLongPress={200}
        >
          {/* Sender name for group chats */}
          {isGroupChat && !message.isMe && message.isFirstInSequence && (
            <Text style={[styles.senderName, { color: message.sender.color || "#FFFFFF" }]}>{message.sender.name}</Text>
          )}

          <View
            style={[
              styles.messageBubble,
              message.isMe ? styles.myBubble : styles.theirBubble,
              getBubbleStyle(),
              message.type === "sticker" && styles.stickerBubble,
              message.type === "image" && styles.imageBubble,
            ]}
          >
            {/* Reply content if this is a reply */}
            {renderReplyContent()}

            {/* Message content */}
            {renderMessageContent()}
          </View>

          {/* Message timestamp */}
          <Text style={[styles.messageTime, message.isMe ? styles.myMessageTime : styles.theirMessageTime]}>
            {message.formattedTime && message.formattedTime.includes(":") ? message.formattedTime.split(" ").pop() : ""}
          </Text>

          {/* Reaction */}
          {renderReaction()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 2,
  },
  firstInSequenceWrapper: {
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  myMessage: {
    justifyContent: "flex-end",
    marginLeft: 50, // Add padding to align with other messages
  },
  theirMessage: {
    justifyContent: "flex-start",
    marginRight: 50, // Give space on the right for their messages
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "100%",
    padding: 10,
    paddingHorizontal: 12,
  },
  stickerBubble: {
    backgroundColor: "transparent",
    padding: 0,
  },
  imageBubble: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 12,
  },
  stickerImage: {
    width: 100,
    height: 100,
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  // My message bubbles (blue)
  myBubble: {
    backgroundColor: "#0084FF",
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
    backgroundColor: "#2D2D2D",
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
    color: "#FFFFFF",
    fontSize: 16,
  },
  theirText: {
    color: "#EEEEEE",
    fontSize: 16,
  },
  timeIndicator: {
    alignItems: "center",
    marginVertical: 10,
  },
  timeIndicatorText: {
    fontSize: 12,
    color: "#AAAAAA",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: "flex-end",
    color: "#AAAAAA",
  },
  myMessageTime: {
    marginRight: 4,
  },
  theirMessageTime: {
    marginLeft: 4,
  },
  voiceMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceWaveContainer: {
    marginHorizontal: 10,
  },
  voiceWave: {
    width: 100,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
  },
  // Reply indicator styles
  replyIndicator: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 132, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  myReplyIndicator: {
    left: -15,
  },
  theirReplyIndicator: {
    right: -15,
  },
  // Reply content styles
  replyContainer: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    width: "100%",
  },
  myReplyContainer: {
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  theirReplyContainer: {
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  replyLine: {
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  replyText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  // Reaction styles
  reactionContainer: {
    position: "absolute",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  myReactionContainer: {
    bottom: -8,
    right: 5,
  },
  theirReactionContainer: {
    bottom: -8,
    left: 5,
  },
  reactionCount: {
    fontSize: 10,
    color: "#333",
    marginLeft: 2,
  },
  mentionText: {
    color: "#4A7AFF",
    fontWeight: "bold",
  },
})

export default MessageItem
