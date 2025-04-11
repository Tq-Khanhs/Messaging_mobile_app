import React from 'react';
import {
    StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={{ padding: 20 }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Nhật ký</Text>
        {/* Thêm nội dung profile ở đây */}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MessagesScreen")}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ContactsScreen")}>
          <Ionicons name="people" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => navigation.navigate("HistoryScreen")}>
          <Ionicons name="time-outline" size={24} color="#0068FF" />
          <Text style={styles.activeNavText}>Nhật ký</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ProfileScreen")}>
          <Ionicons name="person-outline" size={24} color="#888" />            
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    bottomNav: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#333',
        backgroundColor: '#1A1A1A',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    activeNavItem: {
        borderTopWidth: 2,
        borderTopColor: '#0068FF',
    },
    activeNavText: {
        color: '#0068FF',
        fontSize: 12,
        marginTop: 2,
    },
});
export default HistoryScreen;