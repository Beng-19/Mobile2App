import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getCurrentUser, logout } from './auth';

type Props = {
  onLogout?: () => void;
};

const Header = ({ onLogout }: Props) => {
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SHOP APP</Text>

      {user ? (
        <View style={styles.userArea}>
          <Text style={styles.username}>
            {user.username} ({user.role})
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
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  userArea: { alignItems: 'flex-end' },
  username: { color: '#fff', fontSize: 12 },
  logout: { color: '#fff', fontWeight: 'bold', marginTop: 5 },
  guest: { color: '#fff' },
});

export default Header;