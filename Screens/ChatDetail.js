
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image, 
//   FlatList,
//   TextInput,
//   Keyboard,
//   Clipboard,
//   ToastAndroid,
//   Platform,
//   Alert,
//   StatusBar
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import VoiceRecorder from '../components/Voice/VoiceRecorder';
// import StickerPicker from '../components/Sticker/StickerPicker';
// import MoreActions from '../components/MoreAction/MoreActions';
// import InfoModal from '../components/Info/InfoModal';
// import MessageItem from '../components/Message/MessageItem';
// import MessageOptionsModal from '../components/Message/MessageOptionsModal';
// import ReplyBar from '../components/Message/ReplyBar';
// import { formatMessageTime } from '../utils/timeUtils';

// const ChatDetail = ({ route, navigation }) => {
//   const { contact } = route.params || {
//     name: "Nguyễn Minh Đức",
//     avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//     online: false
//   };
  
//   // Refs
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);
  
//   // Current date for comparison
//   const currentDate = new Date();
  
//   // Messages state
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Xin chào, bạn khoẻ không?",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 0), // 10 days ago
//       isMe: false,
//       type: 'text',
//       sender: {
//         id: 2,
//         name: "Nguyễn Minh Đức",
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         online: true
//       }
//     },
//     {
//       id: 2,
//       text: "Mình khoẻ, cảm ơn bạn!",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 5), // 10 days ago
//       isMe: true,
//       type: 'text',
//       sender: {
//         id: 1,
//         name: "Tôi",
//         avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//       }
//     },
//     {
//       id: 3,
//       text: "Bạn có thể giúp mình việc này được không?",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 10), // 10 days ago
//       isMe: false,
//       type: 'text',
//       sender: {
//         id: 2,
//         name: "Nguyễn Minh Đức",
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         online: true
//       }
//     },
//     {
//       id: 4,
//       stickerId: "sticker1",
//       stickerUrl: "https://randomuser.me/api/portraits/men/3.jpg", // Using this as a placeholder for sticker
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5, 10, 20), // 5 days ago
//       isMe: true,
//       type: 'sticker',
//       sender: {
//         id: 1,
//         name: "Tôi",
//         avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//       }
//     },
//     {
//       id: 5,
//       text: "Tui sửa xong á, mà làm sao để coi data á ông ơi, tui test cái",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 10, 30), // 2 days ago
//       isMe: false,
//       type: 'text',
//       sender: {
//         id: 2,
//         name: "Nguyễn Minh Đức",
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         online: true
//       }
//     },
//     {
//       id: 6,
//       text: "Okay",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 10, 32), // 2 days ago
//       isMe: true,
//       type: 'text',
//       sender: {
//         id: 1,
//         name: "Tôi",
//         avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//       }
//     },
//     {
//       id: 7,
//       text: "Tui clone lại code branch main về sửa lại r á",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 35), // Today
//       isMe: false,
//       type: 'text',
//       sender: {
//         id: 2,
//         name: "Nguyễn Minh Đức",
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         online: true
//       }
//     },
//     {
//       id: 8,
//       text: "nay cảm ơn ông nha , ông chia phần cho tui với , chiều tui làm á , tuần sau nhiều k le sợ k kịp @@",
//       timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 36), // Today
//       isMe: false,
//       type: 'text',
//       sender: {
//         id: 2,
//         name: "Nguyễn Minh Đức",
//         avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         online: true
//       }
//     }
//   ]);

//   // UI state
//   const [inputText, setInputText] = useState('');
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
//   const [selectedMessageId, setSelectedMessageId] = useState(null);
//   const [showInfoModal, setShowInfoModal] = useState(false);
//   const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
//   const [showStickerPicker, setShowStickerPicker] = useState(false);
  
//   // Message options modal state
//   const [showMessageOptions, setShowMessageOptions] = useState(false);
//   const [selectedMessageForOptions, setSelectedMessageForOptions] = useState(null);
//   const [messageOptionsPosition, setMessageOptionsPosition] = useState({ x: 0, y: 0 });
  
//   // Reply state
//   const [replyingToMessage, setReplyingToMessage] = useState(null);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => {
//         setKeyboardVisible(true);
//         setShowAttachmentOptions(false);
//         setShowStickerPicker(false);
//       }
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => setKeyboardVisible(false)
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   const handleSend = () => {
//     if (inputText.trim() === '') return;
    
//     // Get the current time
//     const currentTime = new Date();
    
//     const newMessage = {
//       id: messages.length + 1,
//       text: inputText,
//       timestamp: currentTime,
//       isMe: true,
//       type: 'text',
//       sender: {
//         id: 1,
//         name: "Tôi",
//         avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//       },
//       // Add reply information if replying to a message
//       replyTo: replyingToMessage
//     };
    
//     setMessages([newMessage, ...messages]);
//     setInputText('');
//     setReplyingToMessage(null);
//     Keyboard.dismiss();
//   };

//   const handleSendSticker = (sticker) => {
//     // Get the current time
//     const currentTime = new Date();
    
//     const newMessage = {
//       id: messages.length + 1,
//       stickerId: sticker.id,
//       stickerUrl: sticker.url,
//       timestamp: currentTime,
//       isMe: true,
//       type: 'sticker',
//       sender: {
//         id: 1,
//         name: "Tôi",
//         avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//       },
//       // Add reply information if replying to a message
//       replyTo: replyingToMessage
//     };
    
//     setMessages([newMessage, ...messages]);
//     setShowStickerPicker(false);
//     setReplyingToMessage(null);
//   };

//   const handleMessagePress = (messageId) => {
//     // Toggle selected message for time display
//     if (selectedMessageId === messageId) {
//       setSelectedMessageId(null);
//     } else {
//       setSelectedMessageId(messageId);
//     }
//   };

//   const handleMessageLongPress = (message, position) => {
//     setSelectedMessageForOptions(message);
//     setMessageOptionsPosition(position);
//     setShowMessageOptions(true);
//   };

//   const handleDeleteMessage = (messageId) => {
//     // Filter out the deleted message
//     setMessages(messages.filter(message => message.id !== messageId));
    
//     // Show toast notification
//     if (Platform.OS === 'android') {
//       ToastAndroid.show('Đã xóa tin nhắn', ToastAndroid.SHORT);
//     } else {
//       Alert.alert('Thông báo', 'Đã xóa tin nhắn');
//     }
//   };

//   const handleReplyToMessage = (message) => {
//     setReplyingToMessage(message);
//     // Focus the input field
//     if (isKeyboardVisible === false) {
//       // This will trigger the keyboard to show
//       setTimeout(() => {
//         if (inputRef.current) {
//           inputRef.current.focus();
//         }
//       }, 100);
//     }
//   };

//   const handleCopyMessage = (text) => {
//     Clipboard.setString(text);
    
//     // Show toast notification
//     if (Platform.OS === 'android') {
//       ToastAndroid.show('Đã sao chép tin nhắn', ToastAndroid.SHORT);
//     } else {
//       Alert.alert('Thông báo', 'Đã sao chép tin nhắn');
//     }
//   };

//   const handleReactToMessage = (messageId, reactionType) => {
//     // Update the message with the reaction
//     setMessages(messages.map(message => {
//       if (message.id === messageId) {
//         // If the message already has this reaction, remove it
//         // Otherwise, set the new reaction (replacing any existing one)
//         const newReaction = message.reaction === reactionType ? null : reactionType;
//         return { ...message, reaction: newReaction };
//       }
//       return message;
//     }));
//   };

//   const handleSwipeToReply = (message) => {
//     handleReplyToMessage(message);
//   };

//   const handleCancelReply = () => {
//     setReplyingToMessage(null);
//   };

//   const handleScrollToMessage = () => {
//     if (replyingToMessage && flatListRef.current) {
//       // Find the index of the message we want to scroll to
//       const messageIndex = messages.findIndex(m => m.id === replyingToMessage.id);
      
//       if (messageIndex >= 0) {
//         // Scroll to the message
//         flatListRef.current.scrollToIndex({
//           index: messageIndex,
//           animated: true,
//           viewPosition: 0.5
//         });
        
//         // Highlight the message temporarily
//         setSelectedMessageId(replyingToMessage.id);
        
//         // Clear the highlight after a delay
//         setTimeout(() => {
//           setSelectedMessageId(null);
//         }, 2000);
//       }
//     }
//   };

//   // Process messages to determine which ones should show avatar and time
//   const processedMessages = React.useMemo(() => {
//     return messages.map((message, index) => {
//       // Check if this message is from the same sender as the next one
//       // Since the list is inverted, we check the next index (which is actually the previous message in time)
//       const nextMessage = messages[index + 1];
//       const isFirstInSequence = !nextMessage || 
//                                nextMessage.sender.id !== message.sender.id || 
//                                nextMessage.isMe !== message.isMe;
      
//       // Check if this message is the last in a sequence from the same sender
//       const prevMessage = messages[index - 1];
//       const isLastInSequence = !prevMessage || 
//                               prevMessage.sender.id !== message.sender.id || 
//                               prevMessage.isMe !== message.isMe;
      
//       // Determine if we should show the time
//       let showTime = false;
      
//       // Always show time for the first message in the chat
//       if (index === messages.length - 1) {
//         showTime = true;
//       } 
//       // Show time if selected by user
//       else if (message.id === selectedMessageId) {
//         showTime = true;
//       }
//       // Show time if more than 15 minutes have passed since the previous message
//       else if (nextMessage) {
//         // Calculate time difference in minutes
//         const diffInMinutes = Math.floor((message.timestamp - nextMessage.timestamp) / (1000 * 60));
        
//         // Show time if more than 15 minutes have passed
//         if (diffInMinutes > 15) {
//           showTime = true;
//         }
//       }
      
//       // Format the time string based on how old the message is
//       const formattedTime = formatMessageTime(message.timestamp);
      
//       return {
//         ...message,
//         isFirstInSequence,
//         isLastInSequence,
//         showTime,
//         formattedTime
//       };
//     });
//   }, [messages, selectedMessageId]);

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#1E1E1E" barStyle="light-content" />
      
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
        
//         <Image
//           source={{ uri: contact?.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }}
//           style={styles.headerAvatar}
//         />
        
//         <View style={styles.headerInfo}>
//           <Text style={styles.contactName}>{contact?.name || "Nguyễn Minh Đức"}</Text>
//           <Text style={styles.status}>
//             {contact?.online ? "Online" : "Offline"}
//           </Text>
//         </View>
        
//         <View style={styles.headerRightIcons}>
//           <TouchableOpacity 
//             style={styles.iconButton} 
//             onPress={() => navigation.navigate('Call', { contact })}
//           >
//             <Icon name="call" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.iconButton} 
//             onPress={() => navigation.navigate('VideoCall', { contact })}
//           >
//             <Icon name="videocam" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.iconButton} 
//             onPress={() => setShowInfoModal(true)}
//           >
//             <Icon name="info" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={processedMessages}
//         renderItem={({ item }) => (
//           <MessageItem 
//             message={item} 
//             onPress={handleMessagePress}
//             onLongPress={handleMessageLongPress}
//             onSwipeToReply={handleSwipeToReply}
//           />
//         )}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={styles.messagesList}
//         inverted
//         style={styles.chatBackground}
//         onScrollToIndexFailed={info => {
//           console.warn('Failed to scroll to index', info);
//         }}
//       />

//       {/* Reply bar */}
//       {replyingToMessage && (
//         <ReplyBar 
//           message={replyingToMessage}
//           onCancel={handleCancelReply}
//           onScrollToMessage={handleScrollToMessage}
//         />
//       )}

//       <View style={styles.inputContainer}>
//         <TouchableOpacity 
//           style={styles.attachmentButton} 
//           onPress={() => {
//             setShowAttachmentOptions(!showAttachmentOptions);
//             if (showAttachmentOptions) {
//               setShowStickerPicker(false);
//             }
//             if (isKeyboardVisible) {
//               Keyboard.dismiss();
//             }
//           }}
//         >
//           <Icon name="add" size={28} color="#0084FF" />
//         </TouchableOpacity>

//         <TextInput
//           ref={inputRef}
//           style={styles.input}
//           placeholder="Nhập tin nhắn..."
//           placeholderTextColor="#AAAAAA"
//           multiline
//           value={inputText}
//           onChangeText={setInputText}
//           onSubmitEditing={handleSend}
//         />

//         {inputText.length > 0 ? (
//           <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//             <Icon name="send" size={24} color="#0084FF" />
//           </TouchableOpacity>
//         ) : (
//           <>
//             <TouchableOpacity 
//               style={styles.voiceButton} 
//               onPress={() => {
//                 setShowVoiceRecorder(!showVoiceRecorder);
//                 if (!showVoiceRecorder) {
//                   setShowStickerPicker(false);
//                   setShowAttachmentOptions(false);
//                   if (isKeyboardVisible) {
//                     Keyboard.dismiss();
//                   }
//                 }
//               }}
//             >
//               <Icon name="keyboard-voice" size={28} color="#0084FF" />
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={styles.stickerButton} 
//               onPress={() => {
//                 setShowStickerPicker(!showStickerPicker);
//                 if (!showStickerPicker) {
//                   setShowVoiceRecorder(false);
//                   setShowAttachmentOptions(false);
//                   if (isKeyboardVisible) {
//                     Keyboard.dismiss();
//                   }
//                 }
//               }}
//             >
//               <Icon name="insert-emoticon" size={26} color="#FFD700" />
//             </TouchableOpacity>
//           </>
//         )}
//       </View>

//       {/* Attachment options */}
//       {showAttachmentOptions && (
//         <MoreActions 
//           onSendImage={(image) => {
//             const currentTime = new Date();
//             const newMessage = {
//               id: messages.length + 1,
//               imageUri: image.uri,
//               timestamp: currentTime,
//               isMe: true,
//               type: 'image',
//               sender: {
//                 id: 1,
//                 name: "Tôi",
//                 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//               },
//               replyTo: replyingToMessage
//             };
//             setMessages([newMessage, ...messages]);
//             setShowAttachmentOptions(false);
//             setReplyingToMessage(null);
//           }}
//           onSendVideo={(video) => {
//             const currentTime = new Date();
//             const newMessage = {
//               id: messages.length + 1,
//               videoUri: video.uri,
//               timestamp: currentTime,
//               isMe: true,
//               type: 'video',
//               sender: {
//                 id: 1,
//                 name: "Tôi",
//                 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//               },
//               replyTo: replyingToMessage
//             };
//             setMessages([newMessage, ...messages]);
//             setShowAttachmentOptions(false);
//             setReplyingToMessage(null);
//           }}
//           onSendDocument={(document) => {
//             const currentTime = new Date();
//             const newMessage = {
//               id: messages.length + 1,
//               documentUri: document.uri,
//               documentName: document.name,
//               timestamp: currentTime,
//               isMe: true,
//               type: 'document',
//               sender: {
//                 id: 1,
//                 name: "Tôi",
//                 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//               },
//               replyTo: replyingToMessage
//             };
//             setMessages([newMessage, ...messages]);
//             setShowAttachmentOptions(false);
//             setReplyingToMessage(null);
//           }}
//           onSendLocation={(location) => {
//             const currentTime = new Date();
//             const newMessage = {
//               id: messages.length + 1,
//               location: {
//                 latitude: location.coords.latitude,
//                 longitude: location.coords.longitude,
//               },
//               timestamp: currentTime,
//               isMe: true,
//               type: 'location',
//               sender: {
//                 id: 1,
//                 name: "Tôi",
//                 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//               },
//               replyTo: replyingToMessage
//             };
//             setMessages([newMessage, ...messages]);
//             setShowAttachmentOptions(false);
//             setReplyingToMessage(null);
//           }}
//         />
//       )}

//       {/* Voice recorder */}
//       {showVoiceRecorder && (
//         <VoiceRecorder 
//           onSend={(duration) => {
//             const currentTime = new Date();
//             const newMessage = {
//               id: messages.length + 1,
//               voiceDuration: duration,
//               timestamp: currentTime,
//               isMe: true,
//               type: 'voice',
//               sender: {
//                 id: 1,
//                 name: "Tôi",
//                 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
//               },
//               replyTo: replyingToMessage
//             };
//             setMessages([newMessage, ...messages]);
//             setShowVoiceRecorder(false);
//             setReplyingToMessage(null);
//           }} 
//           onCancel={() => setShowVoiceRecorder(false)} 
//         />
//       )}

//       {/* Sticker picker */}
//       {showStickerPicker && (
//         <StickerPicker onStickerSelect={handleSendSticker} />
//       )}

//       {/* Message Options Modal */}
//       <MessageOptionsModal 
//         visible={showMessageOptions}
//         onClose={() => setShowMessageOptions(false)}
//         message={selectedMessageForOptions}
//         position={messageOptionsPosition}
//         onDelete={handleDeleteMessage}
//         onReply={handleReplyToMessage}
//         onCopy={handleCopyMessage}
//         onReact={handleReactToMessage}
//       />

//       {/* Info Modal */}
//       {showInfoModal && (
//         <InfoModal 
//           contact={contact} 
//           visible={showInfoModal} 
//           onClose={() => setShowInfoModal(false)} 
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#1E1E1E',
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#333333',
//   },
//   backButton: {
//     padding: 5,
//   },
//   chatBackground: {
//     backgroundColor: '#121212',
//   },
//   headerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   headerInfo: {
//     flex: 1,
//   },
//   contactName: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#FFFFFF',
//   },
//   status: {
//     color: '#AAAAAA',
//     fontSize: 12,
//   },
//   headerRightIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     marginLeft: 15,
//     padding: 5,
//   },
//   messagesList: {
//     padding: 10,
//     paddingBottom: 20,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#1E1E1E',
//     borderTopWidth: 0.5,
//     borderTopColor: '#333333',
//   },
//   attachmentButton: {
//     padding: 8,
//     marginRight: 5,
//   },
//   voiceButton: {
//     padding: 8,
//     marginLeft: 5,
//   },
//   stickerButton: {
//     padding: 8,
//     marginLeft: 5,
//   },
//   input: {
//     flex: 1,
//     minHeight: 36,
//     maxHeight: 100,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#2D2D2D',
//     borderRadius: 18,
//     marginHorizontal: 5,
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
//   sendButton: {
//     padding: 8,
//     marginLeft: 5,
//   },
// });

// export default ChatDetail;
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  TextInput,
  Keyboard,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VoiceRecorder from '../components/Voice/VoiceRecorder';
import StickerPicker from '../components/Sticker/StickerPicker';
import MoreActions from '../components/MoreAction/MoreActions';
import InfoModal from '../components/Info/InfoModal';
import MessageItem from '../components/Message/MessageItem';
import MessageOptionsModal from '../components/Message/MessageOptionsModal';
import ReplyBar from '../components/Message/ReplyBar';
import SearchMessages from '../components/Message/SearchMessages';
import { formatMessageTime } from '../utils/timeUtils';
// import apiService from '../services/apiService';

const ChatDetail = ({ route, navigation }) => {
  const { contact } = route.params || {
    id: 2,
    name: "Nguyễn Minh Đức",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    online: false
  };
  
  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  
  // Current date for comparison
  const currentDate = new Date();
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);

  // UI state
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Message options modal state
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState(null);
  const [messageOptionsPosition, setMessageOptionsPosition] = useState({ x: 0, y: 0 });
  
  // Reply state
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  
  // Search state
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Fetch messages from the backend
  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle scrollToMessage from navigation params
  useEffect(() => {
    if (route.params?.scrollToMessage) {
      handleScrollToMessage(route.params.scrollToMessage);
    }
  }, [route.params?.scrollToMessage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use static data for testing
      const staticMessages = [
        {
          id: 1,
          text: "Xin chào, bạn khoẻ không?",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 0),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        },
        {
          id: 2,
          text: "Mình khoẻ, cảm ơn bạn!",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 5),
          isMe: true,
          type: 'text',
          sender: {
            id: 1,
            name: "Tôi",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg"
          }
        },
        {
          id: 3,
          text: "Bạn có thể giúp mình việc này được không?",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 10, 8, 10),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        },
        {
          id: 4,
          stickerId: "sticker1",
          stickerUrl: "https://randomuser.me/api/portraits/men/3.jpg",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5, 10, 20),
          isMe: true,
          type: 'sticker',
          sender: {
            id: 1,
            name: "Tôi",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg"
          }
        },
        {
          id: 5,
          text: "Tui sửa xong á, mà làm sao để coi data á ông ơi, tui test cái",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 10, 30),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        },
        {
          id: 6,
          text: "Okay",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2, 10, 32),
          isMe: true,
          type: 'text',
          sender: {
            id: 1,
            name: "Tôi",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg"
          }
        },
        {
          id: 7,
          text: "Tui clone lại code branch main về sửa lại r á",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 35),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        },
        {
          id: 8,
          text: "nay cảm ơn ông nha , ông chia phần cho tui với , chiều tui làm á , tuần sau nhiều k le sợ k kịp @@",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 36),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        },
        {
          id: 9,
          text: "Bạn có thể giúp mình việc này được không?",
          timestamp: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 20),
          isMe: false,
          type: 'text',
          sender: {
            id: 2,
            name: "Nguyễn Minh Đức",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            online: true
          }
        }
      ];
      
      setMessages(staticMessages);
      
      // Set the oldest message timestamp for pagination
      if (staticMessages.length > 0) {
        const oldestMessage = staticMessages[staticMessages.length - 1];
        setOldestMessageTimestamp(oldestMessage.timestamp);
      }
      
      // For testing, set hasMoreMessages to false since we're using static data
      setHasMoreMessages(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore) return;
    
    try {
      setLoadingMore(true);
      // For testing, just set hasMoreMessages to false
      setHasMoreMessages(false);
    } catch (err) {
      console.error('Error loading more messages:', err);
      // Show error toast
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to load more messages', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to load more messages');
      }
    } finally {
      setLoadingMore(false);
    }
  };

  // Helper function to find a message by ID
  const findMessageById = (messageId) => {
    return messages.find(msg => msg.id === messageId);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setShowAttachmentOptions(false);
        setShowStickerPicker(false);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    // Get the current time
    const currentTime = new Date();
    
    // Create new message object
    const newMessage = {
      id: `temp-${Date.now()}`, // Temporary ID until we get the real one from the server
      text: inputText,
      timestamp: currentTime,
      isMe: true,
      type: 'text',
      sender: {
        id: 1,
        name: "Tôi",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      // Add reply information if replying to a message
      replyTo: replyingToMessage
    };
    
    // Optimistically update UI
    setMessages([newMessage, ...messages]);
    setInputText('');
    setReplyingToMessage(null);
    Keyboard.dismiss();
  };

  const handleSendSticker = async (sticker) => {
    // Get the current time
    const currentTime = new Date();
    
    const newMessage = {
      id: `temp-${Date.now()}`,
      stickerId: sticker.id,
      stickerUrl: sticker.url,
      timestamp: currentTime,
      isMe: true,
      type: 'sticker',
      sender: {
        id: 1,
        name: "Tôi",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg"
      },
      // Add reply information if replying to a message
      replyTo: replyingToMessage
    };
    
    // Optimistically update UI
    setMessages([newMessage, ...messages]);
    setShowStickerPicker(false);
    setReplyingToMessage(null);
  };

  const handleMessagePress = (messageId) => {
    // Toggle selected message for time display
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    } else {
      setSelectedMessageId(messageId);
    }
  };

  const handleMessageLongPress = (message, position) => {
    setSelectedMessageForOptions(message);
    setMessageOptionsPosition(position);
    setShowMessageOptions(true);
  };

  const handleDeleteMessage = async (messageId) => {
    // Optimistically update UI
    setMessages(messages.filter(message => message.id !== messageId));
    
    // Show toast notification
    if (Platform.OS === 'android') {
      ToastAndroid.show('Đã xóa tin nhắn', ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', 'Đã xóa tin nhắn');
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyingToMessage(message);
    // Focus the input field
    if (isKeyboardVisible === false) {
      // This will trigger the keyboard to show
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleCopyMessage = (text) => {
    Clipboard.setString(text);
    
    // Show toast notification
    if (Platform.OS === 'android') {
      ToastAndroid.show('Đã sao chép tin nhắn', ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', 'Đã sao chép tin nhắn');
    }
  };

  const handleReactToMessage = async (messageId, reactionType) => {
    // Update the message with the reaction
    const updatedMessages = messages.map(message => {
      if (message.id === messageId) {
        // If the message already has this reaction, remove it
        // Otherwise, set the new reaction (replacing any existing one)
        const newReaction = message.reaction === reactionType ? null : reactionType;
        return { ...message, reaction: newReaction };
      }
      return message;
    });
    
    setMessages(updatedMessages);
  };

  const handleSwipeToReply = (message) => {
    handleReplyToMessage(message);
  };

  const handleCancelReply = () => {
    setReplyingToMessage(null);
  };

  const handleScrollToMessage = (message) => {
    if (message && flatListRef.current) {
      // Find the index of the message we want to scroll to
      const messageIndex = messages.findIndex(m => m.id === message.id);
      
      if (messageIndex >= 0) {
        // Scroll to the message
        flatListRef.current.scrollToIndex({
          index: messageIndex,
          animated: true,
          viewPosition: 0.5
        });
        
        // Highlight the message temporarily
        setHighlightedMessageId(message.id);
        
        // Clear the highlight after a delay
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 2000);
      }
    }
  };

  // This function will be called when the search button is clicked in InfoModal
  const handleSearchMessages = () => {
    setShowSearch(true);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setHighlightedMessageId(null);
  };

  // Process messages to determine which ones should show avatar and time
  const processedMessages = React.useMemo(() => {
    return messages.map((message, index) => {
      // Check if this message is from the same sender as the next one
      // Since the list is inverted, we check the next index (which is actually the previous message in time)
      const nextMessage = messages[index + 1];
      const isFirstInSequence = !nextMessage || 
                               nextMessage.sender.id !== message.sender.id || 
                               nextMessage.isMe !== message.isMe;
      
      // Check if this message is the last in a sequence from the same sender
      const prevMessage = messages[index - 1];
      const isLastInSequence = !prevMessage || 
                              prevMessage.sender.id !== message.sender.id || 
                              prevMessage.isMe !== message.isMe;
      
      // Determine if we should show the time
      let showTime = false;
      
      // Always show time for the first message in the chat
      if (index === messages.length - 1) {
        showTime = true;
      } 
      // Show time if selected by user
      else if (message.id === selectedMessageId) {
        showTime = true;
      }
      // Show time if more than 15 minutes have passed since the previous message
      else if (nextMessage) {
        // Calculate time difference in minutes
        const diffInMinutes = Math.floor((message.timestamp - nextMessage.timestamp) / (1000 * 60));
        
        // Show time if more than 15 minutes have passed
        if (diffInMinutes > 15) {
          showTime = true;
        }
      }
      
      // Format the time string based on how old the message is
      const formattedTime = formatMessageTime(message.timestamp);
      
      // Check if this message is highlighted (for search results)
      const isHighlighted = message.id === highlightedMessageId;
      
      return {
        ...message,
        isFirstInSequence,
        isLastInSequence,
        showTime,
        formattedTime,
        isHighlighted
      };
    });
  }, [messages, selectedMessageId, highlightedMessageId]);

  // Custom message renderer that handles highlighting with blue border
  const renderMessage = ({ item }) => {
    return (
      <View style={item.isHighlighted ? styles.highlightedMessageContainer : null}>
        <MessageItem 
          message={item} 
          onPress={handleMessagePress}
          onLongPress={handleMessageLongPress}
          onSwipeToReply={handleSwipeToReply}
          onReplyPress={(replyMessage) => handleScrollToMessage(replyMessage)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E1E1E" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Image
          source={{ uri: contact?.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }}
          style={styles.headerAvatar}
        />
        
        <View style={styles.headerInfo}>
          <Text style={styles.contactName}>{contact?.name || "Nguyễn Minh Đức"}</Text>
          <Text style={styles.status}>
            {contact?.online ? "Online" : "Offline"}
          </Text>
        </View>
        
        <View style={styles.headerRightIcons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Call', { contact })}
          >
            <Icon name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('VideoCall', { contact })}
          >
            <Icon name="videocam" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowInfoModal(true)}
          >
            <Icon name="info" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084FF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchMessages}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={processedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          style={styles.chatBackground}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#0084FF" />
              <Text style={styles.loadingMoreText}>Loading more messages...</Text>
            </View>
          ) : null}
          onScrollToIndexFailed={info => {
            console.warn('Failed to scroll to index', info);
          }}
        />
      )}

      {/* Reply bar */}
      {replyingToMessage && (
        <ReplyBar 
          message={replyingToMessage}
          onCancel={handleCancelReply}
          onScrollToMessage={() => handleScrollToMessage(replyingToMessage)}
        />
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachmentButton} 
          onPress={() => {
            setShowAttachmentOptions(!showAttachmentOptions);
            if (showAttachmentOptions) {
              setShowStickerPicker(false);
            }
            if (isKeyboardVisible) {
              Keyboard.dismiss();
            }
          }}
        >
          <Icon name="add" size={28} color="#0084FF" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#AAAAAA"
          multiline
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />

        {inputText.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={24} color="#0084FF" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={() => {
                setShowVoiceRecorder(!showVoiceRecorder);
                if (!showVoiceRecorder) {
                  setShowStickerPicker(false);
                  setShowAttachmentOptions(false);
                  if (isKeyboardVisible) {
                    Keyboard.dismiss();
                  }
                }
              }}
            >
              <Icon name="keyboard-voice" size={28} color="#0084FF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.stickerButton} 
              onPress={() => {
                setShowStickerPicker(!showStickerPicker);
                if (!showStickerPicker) {
                  setShowVoiceRecorder(false);
                  setShowAttachmentOptions(false);
                  if (isKeyboardVisible) {
                    Keyboard.dismiss();
                  }
                }
              }}
            >
              <Icon name="insert-emoticon" size={26} color="#FFD700" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Attachment options */}
      {showAttachmentOptions && (
        <MoreActions 
          onSendImage={async (image) => {
            const currentTime = new Date();
            const newMessage = {
              id: `temp-${Date.now()}`,
              imageUri: image.uri,
              timestamp: currentTime,
              isMe: true,
              type: 'image',
              sender: {
                id: 1,
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              replyTo: replyingToMessage
            };
            
            // Optimistically update UI
            setMessages([newMessage, ...messages]);
            setShowAttachmentOptions(false);
            setReplyingToMessage(null);
          }}
          onSendVideo={async (video) => {
            const currentTime = new Date();
            const newMessage = {
              id: `temp-${Date.now()}`,
              videoUri: video.uri,
              timestamp: currentTime,
              isMe: true,
              type: 'video',
              sender: {
                id: 1,
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              replyTo: replyingToMessage
            };
            
            // Optimistically update UI
            setMessages([newMessage, ...messages]);
            setShowAttachmentOptions(false);
            setReplyingToMessage(null);
          }}
          onSendDocument={async (document) => {
            const currentTime = new Date();
            const newMessage = {
              id: `temp-${Date.now()}`,
              documentUri: document.uri,
              documentName: document.name,
              timestamp: currentTime,
              isMe: true,
              type: 'document',
              sender: {
                id: 1,
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              replyTo: replyingToMessage
            };
            
            // Optimistically update UI
            setMessages([newMessage, ...messages]);
            setShowAttachmentOptions(false);
            setReplyingToMessage(null);
          }}
          onSendLocation={async (location) => {
            const currentTime = new Date();
            const newMessage = {
              id: `temp-${Date.now()}`,
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              timestamp: currentTime,
              isMe: true,
              type: 'location',
              sender: {
                id: 1,
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              replyTo: replyingToMessage
            };
            
            // Optimistically update UI
            setMessages([newMessage, ...messages]);
            setShowAttachmentOptions(false);
            setReplyingToMessage(null);
          }}
        />
      )}

      {/* Voice recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder 
          onSend={async (audioUri, duration) => {
            const currentTime = new Date();
            const newMessage = {
              id: `temp-${Date.now()}`,
              audioUri,
              voiceDuration: duration,
              timestamp: currentTime,
              isMe: true,
              type: 'voice',
              sender: {
                id: 1,
                name: "Tôi",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              replyTo: replyingToMessage
            };
            
            // Optimistically update UI
            setMessages([newMessage, ...messages]);
            setShowVoiceRecorder(false);
            setReplyingToMessage(null);
          }} 
          onCancel={() => setShowVoiceRecorder(false)} 
        />
      )}

      {/* Sticker picker */}
      {showStickerPicker && (
        <StickerPicker onStickerSelect={handleSendSticker} />
      )}

      {/* Message Options Modal */}
      <MessageOptionsModal 
        visible={showMessageOptions}
        onClose={() => setShowMessageOptions(false)}
        message={selectedMessageForOptions}
        position={messageOptionsPosition}
        onDelete={handleDeleteMessage}
        onReply={handleReplyToMessage}
        onCopy={handleCopyMessage}
        onReact={handleReactToMessage}
      />

      {/* Info Modal */}
      {showInfoModal && (
        <InfoModal 
          contact={contact} 
          visible={showInfoModal} 
          onClose={() => setShowInfoModal(false)} 
          navigation={navigation}
          onSearchMessages={handleSearchMessages}
        />
      )}

      {/* Search Messages Component */}
      {showSearch && (
        <SearchMessages 
          contactId={contact?.id || 2}
          onClose={handleCloseSearch}
          onScrollToMessage={handleScrollToMessage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 5,
  },
  chatBackground: {
    backgroundColor: '#121212',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  status: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 5,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 5,
  },
  stickerButton: {
    padding: 8,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 18,
    marginHorizontal: 5,
    color: '#FFFFFF',
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0084FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  highlightedMessageContainer: {
    borderWidth: 2,
    borderColor: '#0084FF',
    borderRadius: 12,
    marginVertical: 2,
  },
});

export default ChatDetail;