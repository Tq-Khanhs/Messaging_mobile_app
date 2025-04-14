import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VideoCallScreen = ({ route, navigation }) => {
  const { contact } = route.params;
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Đang gọi...');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    // Simulate call connecting after 2 seconds
    const connectTimeout = setTimeout(() => {
      setCallStatus('Đang kết nối...');
      
      // Simulate call connected after another 2 seconds
      const connectedTimeout = setTimeout(() => {
        setCallStatus('Đã kết nối');
        
        // Start call duration timer
        const durationInterval = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        // Clean up interval on unmount
        return () => clearInterval(durationInterval);
      }, 2000);
      
      return () => clearTimeout(connectedTimeout);
    }, 2000);
    
    return () => clearTimeout(connectTimeout);
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <View style={styles.container}>
      {/* Remote video (full screen) */}
      <View style={styles.remoteVideoContainer}>
        <Image 
          source={{ uri: contact.avatar }} 
          style={styles.remoteVideo}
          resizeMode="cover"
        />
        <View style={styles.callStatusContainer}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.callStatus}>
            {callStatus === 'Đã kết nối' ? formatDuration(callDuration) : callStatus}
          </Text>
        </View>
      </View>
      
      {/* Local video (small overlay) */}
      <View style={styles.localVideoContainer}>
        <Image 
          source={{ uri: "https://randomuser.me/api/portraits/men/2.jpg" }} 
          style={[
            styles.localVideo,
            !isCameraOn && styles.cameraOff
          ]}
          resizeMode="cover"
        />
        {!isCameraOn && (
          <View style={styles.cameraOffIndicator}>
            <Icon name="videocam-off" size={24} color="#FFFFFF" />
          </View>
        )}
      </View>
      
      {/* Call controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]} 
          onPress={toggleCamera}
        >
          <Icon name={isCameraOn ? "videocam" : "videocam-off"} size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, !isMicOn && styles.controlButtonActive]} 
          onPress={toggleMic}
        >
          <Icon name={isMicOn ? "mic" : "mic-off"} size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Icon name="call-end" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="switch-camera" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="more-horiz" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
  },
  callStatusContainer: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  callStatus: {
    color: '#FFFFFF',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  localVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D2D2D',
  },
  cameraOff: {
    opacity: 0.5,
  },
  cameraOffIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCallScreen;