
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  initDatabase,
  fetchUsers,
  updateUser,
  deleteUser,
  User,
} from './database';

const UserManagement = ({ onBack }: { onBack?: () => void }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const start = async () => {
      await initDatabase();
      await loadUsers();
    };
    start();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Lỗi tải user:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
    }
  };

  const handleChangeRole = (item: User) => {
    const newRole = item.role === 'admin' ? 'user' : 'admin';

    Alert.alert(
      'Thay đổi quyền',
      `Bạn muốn đổi quyền của ${item.username} thành ${newRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              await updateUser({ ...item, role: newRole });
              await loadUsers();
            } catch (error) {
              console.error('Lỗi cập nhật quyền:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật quyền.');
            }
          },
        },
      ],
    );
  };

  const handleDelete = (item: User) => {
    if (item.username === 'admin') {
      Alert.alert('Thông báo', 'Không thể xóa tài khoản admin mặc định.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài khoản ${item.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(item.id);
              await loadUsers();
            } catch (error) {
              console.error('Lỗi xóa user:', error);
              Alert.alert('Lỗi', 'Không thể xóa tài khoản.');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.role}>Quyền: {item.role}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => handleChangeRole(item)}
        >
          <Text style={styles.buttonText}>Đổi quyền</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>QUẢN LÝ USER</Text>
      <Text style={styles.subtitle}>
        Danh sách tài khoản: {users.length}
      </Text>

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có tài khoản nào.</Text>
        }
      />
    </View>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 10,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  role: {
    color: '#555',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  roleButton: {
    backgroundColor: '#2563eb',
    padding: 9,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    padding: 9,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
});
