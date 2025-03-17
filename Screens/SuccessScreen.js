import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SuccessScreen = ({ navigation }) => {
    const handleSubmit = () => {
        Alert.alert(
          `Xác nhận`,
          'Chú ý: Bạn sẽ không thể đăng nhập ở 1 số thiết bị khác nếu chưa tạo mật khẩu. Chọn Để sau, bạn sẽ phải tạo mật khẩu khi đăng xuất tài khoản',
          [
            {
              text: 'Để sau',
              style: 'cancel',
            },
            {
              text: 'Tạo mật khẩu',
              onPress: () => {
                navigation.navigate('CreateNewPassword');
                
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
      
      <Text style={styles.headerTitle}>Tạo mật khẩu mới</Text>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon name="check" size={48} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.successMessage}>Đăng Nhập Thành Công</Text>


      <Text style={styles.instructions}>
        Bây giờ bạn có thể tạo lại mật khẩu mới. Tài khoản và mật khẩu này dùng để đăng nhập trên bất kì thiết bị nào.
      </Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.createPasswordButton}
          onPress={() => navigation.navigate('CreateNewPassword')}
        >
          <Text style={styles.createPasswordText} onPress={navigation.navigate('CreateNewPassword')}>TẠO MẬT KHẨU</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSubmit}
        >
          <Text style={styles.laterText} onPress={navigation.goBack()}>Để sau</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 64,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessage: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  createPasswordButton: {
    backgroundColor: '#00A7E7',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 16,
    width: '80%',
  },
  createPasswordText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  laterText: {
    color: '#00A7E7',
    fontSize: 16,
  },
});

export default SuccessScreen;