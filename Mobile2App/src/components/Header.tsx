
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, logout } from './auth';

type Props = {
  onLogout?: () => void;
};

const Header = ({ onLogout }: Props) => {
  const [user, setUser] = useState(getCurrentUser());

  // Cập nhật thông tin khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      setUser(getCurrentUser());
    }, []),
  );

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            setUser(null);
            onLogout?.();
            Alert.alert('Thông báo', 'Đã đăng xuất thành công');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHOP APP</Text>

      {user ? (
        <View style={styles.userArea}>
          <Text style={styles.username}>
            Xin chào, {user.username}
          </Text>

          <Text style={styles.role}>
            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.guest}>Khách</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E53935',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userArea: {
    alignItems: 'flex-end',
  },
  username: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  role: {
    color: '#FFE0E0',
    fontSize: 11,
    marginTop: 2,
  },
  logout: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  guest: {
    color: '#fff',
    fontSize: 13,
  },
});

export default Header;
