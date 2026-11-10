import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Header from '../Header';
import { getCurrentUser } from '../auth';

const AdminDashboard = ({ navigation }: any) => {
  const user = getCurrentUser();

  const checkAdmin = () => {
    if (!user || user.role !== 'admin') {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập bằng tài khoản Admin');
      navigation.navigate('LoginSqlite');
      return false;
    }
    return true;
  };

  const openScreen = (screen: string) => {
    if (!checkAdmin()) return;
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <Header />

      <Text style={styles.title}>TRANG QUẢN TRỊ ADMIN</Text>
      <Text style={styles.welcome}>
        Xin chào {user?.username || 'Admin'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => openScreen('UserManagement')}
      >
        <Text style={styles.buttonText}>Quản lý người dùng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => openScreen('CategoryManagement')}
      >
        <Text style={styles.buttonText}>Quản lý danh mục</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => openScreen('ProductManagement')}
      >
        <Text style={styles.buttonText}>Quản lý sản phẩm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
  },
  welcome: { textAlign: 'center', margin: 15, fontSize: 16 },
  button: {
    backgroundColor: '#E53935',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 18,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AdminDashboard;