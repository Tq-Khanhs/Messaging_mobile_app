import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreatePasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const handleUpdate = () => {
    if (password === confirmPassword && password.length > 0) {
      console.log('Password updated');
    }
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
        <Text style={styles.headerTitle}>Tạo mật khẩu mới</Text>
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên Zalo của bạn.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setActiveInput('password')}
              onBlur={() => setActiveInput(null)}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#666666"
            />
            <TouchableOpacity 
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showButtonText}>HIỆN</Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputUnderline,
            activeInput === 'password' && styles.activeUnderline
          ]} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setActiveInput('confirm')}
              onBlur={() => setActiveInput(null)}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#666666"
            />
          </View>
          <View style={[
            styles.inputUnderline,
            activeInput === 'confirm' && styles.activeUnderline
          ]} />
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.updateButton,
          password === confirmPassword && password.length > 0 && styles.updateButtonActive
        ]}
        onPress={handleUpdate}
        disabled={password !== confirmPassword || password.length === 0}
      >
        <Text style={styles.updateButtonText}>CẬP NHẬT</Text>
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
  warningContainer: {
    backgroundColor: '#000000',
    padding: 16,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#666666',
    marginTop: 4,
  },
  activeUnderline: {
    height: 2,
    backgroundColor: '#00A7E7',
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: '#333333',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 32,
  },
  updateButtonActive: {
    backgroundColor: '#00A7E7',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreatePasswordScreen;