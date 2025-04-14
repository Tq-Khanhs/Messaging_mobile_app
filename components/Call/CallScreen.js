import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CallScreen = ({ route, navigation }) => {
  const { contact } = route.params;
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Đang gọi...');

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

  return (
    <View style={styles.container}>
      <View style={styles.contactInfoContainer}>
        <Image 
          source={{ uri: contact.avatar }} 
          style={styles.contactAvatar} 
        />
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.callStatus}>
          {callStatus === 'Đã kết nối' ? formatDuration(callDuration) : callStatus}
        </Text>
      </View>
      
      <View style={styles.callControlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="volume-up" size={30} color="#FFFFFF" />
          <Text style={styles.controlText}>Loa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="mic-off" size={30} color="#FFFFFF" />
          <Text style={styles.controlText}>Tắt tiếng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="dialpad" size={30} color="#FFFFFF" />
          <Text style={styles.controlText}>Bàn phím</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <Icon name="call-end" size={36} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
    padding: 20,
  },
  contactInfoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  contactAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callStatus: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  callControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
});

export default CallScreen;