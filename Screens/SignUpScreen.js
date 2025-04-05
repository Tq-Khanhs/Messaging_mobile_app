import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [socialTermsAccepted, setSocialTermsAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />


      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>


      <Text style={styles.title}>Nhập số điện thoại</Text>


      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.countryCodeButton}>
          <Text style={styles.countryCodeText}>+84</Text>
          <Icon name="keyboard-arrow-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#666666"
        />
      </View>


      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với các{' '}
            <Text style={styles.termsLink}>điều khoản sử dụng Zalo</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setSocialTermsAccepted(!socialTermsAccepted)}
        >
          <View style={[styles.checkbox, socialTermsAccepted && styles.checkboxChecked]}>
            {socialTermsAccepted && <Icon name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.termsText}>
            Tôi đồng ý với{' '}
            <Text style={styles.termsLink}>điều khoản Mạng xã hội của Zalo</Text>
          </Text>
        </TouchableOpacity>
      </View>


      <TouchableOpacity
        style={[
          styles.continueButton,
          (!termsAccepted || !socialTermsAccepted) && styles.continueButtonDisabled
        ]}
        disabled={!termsAccepted || !socialTermsAccepted}
        onPress={() => navigation.navigate("CreatePasswordScreen")}
      >
        <Text style={styles.continueButtonText}>Tiếp tục</Text>
      </TouchableOpacity>


      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#0068FF',
    borderRadius: 8,
    height: 48,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#333333',
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 12,
  },
  termsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0068FF',
    borderColor: '#0068FF',
  },
  termsText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#0068FF',
  },
  continueButton: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 48,
    backgroundColor: '#0068FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#333333',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loginLink: {
    color: '#0068FF',
    fontSize: 14,
  },
});

export default SignUpScreen;