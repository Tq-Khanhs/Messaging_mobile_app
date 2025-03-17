import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PasswordRecoveryScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  

  const handleSubmit = () => {
    Alert.alert(
      `Xác nhận số điện thoại ${phoneNumber}?`,
      'Số điện thoại này sẽ được sử dụng để nhận mã xác thực',
      [
        {
          text: 'HỦY',
          style: 'cancel',
        },
        {
          text: 'XÁC NHẬN',
          onPress: () => {
            navigation.navigate('Verification', { phoneNumber });
          },
          style: 'default',
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
      

      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lấy lại mật khẩu</Text>
      </View>

      
      <Text style={styles.instructions}>
        Nhập số điện thoại để lấy lại mật khẩu
      </Text>

      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder=""
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setPhoneNumber('')}
            >
              <Icon name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Icon name="arrow-forward" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1B',
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00A7E7',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
  },
  submitButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#00A7E7',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PasswordRecoveryScreen;