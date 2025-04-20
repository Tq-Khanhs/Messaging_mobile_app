import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  PanResponder,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatRecordingTime } from '../../utils/timeUtils';

const { height } = Dimensions.get('window');

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const recordingTimer = useRef(null);
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const lockAnimation = useRef(new Animated.Value(0)).current;
  const cancelThreshold = -100; // Threshold to cancel recording when sliding up

  // Pan responder for slide to cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical movements when recording
        return isRecording && Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isRecording) {
          // Only allow sliding up (negative dy)
          if (gestureState.dy < 0) {
            // Limit the slide distance
            const newValue = Math.max(gestureState.dy, cancelThreshold);
            slideAnimation.setValue(newValue);
            
            // Set cancelling state based on threshold
            setIsCancelling(newValue <= cancelThreshold / 2);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isRecording) {
          // If slid up far enough, cancel recording
          if (gestureState.dy <= cancelThreshold) {
            cancelRecording();
          } else {
            // Reset position with animation
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            setIsCancelling(false);
          }
        }
      },
    })
  ).current;

  // Animation for voice recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
        ])
      ).start();
      
      // Animate lock button after 1 second of recording
      setTimeout(() => {
        if (isRecording) {
          Animated.timing(lockAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }, 1000);
    } else {
      waveAnimation.setValue(0);
      lockAnimation.setValue(0);
    }
  }, [isRecording]);

  // Timer for voice recording
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimer.current);
    }

    return () => {
      clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Here you would normally start the actual voice recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Here you would normally stop the actual voice recording
    onSend(recordingTime);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setIsCancelling(false);
    slideAnimation.setValue(0);
    onCancel();
    // Here you would normally cancel and delete the recording
  };

  const lockRecording = () => {
    // Lock the recording so it continues without holding
    // This would typically be implemented with a state that keeps recording going
    // even after the user releases the button
  };

  return (
    <View style={styles.voiceRecorderContainer}>
      <Animated.View 
        style={[
          styles.voiceRecorderContent,
          {
            transform: [{ translateY: slideAnimation }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {isRecording ? (
          <>
            <Text style={[
              styles.recordingTimeText,
              isCancelling && styles.cancellingText
            ]}>
              {isCancelling ? 'Vuốt lên để huỷ' : formatRecordingTime(recordingTime)}
            </Text>
            <View style={styles.voiceWaveContainer}>
              <Animated.View 
                style={[
                  styles.voiceWaveBar, 
                  { height: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 40]
                  }) }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.voiceWaveBar, 
                  { height: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 30]
                  }) }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.voiceWaveBar, 
                  { height: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 20]
                  }) }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.voiceWaveBar, 
                  { height: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 35]
                  }) }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.voiceWaveBar, 
                  { height: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 15]
                  }) }
                ]} 
              />
            </View>
            <Text style={styles.recordingHintText}>
              {isCancelling ? 'Thả để huỷ' : 'Vuốt lên để huỷ'}
            </Text>
            
            {/* Lock button that appears after 1 second */}
            <Animated.View 
              style={[
                styles.lockButtonContainer,
                {
                  opacity: lockAnimation,
                  transform: [
                    { translateY: lockAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })}
                  ]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.lockButton}
                onPress={lockRecording}
              >
                <Icon name="lock" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.lockText}>Khoá</Text>
            </Animated.View>
          </>
        ) : (
          <Text style={styles.recordingHintText}>Nhấn và giữ để ghi âm</Text>
        )}
      </Animated.View>
      
      <View style={styles.voiceRecorderControls}>
        <TouchableOpacity 
          style={styles.cancelRecordingButton} 
          onPress={onCancel}
        >
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {isRecording ? (
          <TouchableOpacity 
            style={[styles.recordButton, styles.recordingButton]} 
            onPress={stopRecording}
          >
            <Icon name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.recordButton} 
            onPress={startRecording}
            onLongPress={startRecording}
          >
            <Icon name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  voiceRecorderContainer: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    padding: 15,
  },
  voiceRecorderContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingTimeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancellingText: {
    color: '#F44336',
  },
  recordingHintText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 10,
  },
  voiceRecorderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  cancelRecordingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  voiceWaveBar: {
    width: 4,
    backgroundColor: '#0084FF',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  lockButtonContainer: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
  },
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 132, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default VoiceRecorder;