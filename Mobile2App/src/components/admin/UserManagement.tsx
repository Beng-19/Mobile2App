import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUsers,
  updateUserRole,
  deleteUser,
  User,
} from '../database';
import { getCurrentUser } from '../auth';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUser = getCurrentUser();

  const loadUsers = async () => {
    setUsers(await fetchUsers());
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  const changeRole = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Không thể thay đổi quyền', 'Bạn không thể thay đổi quyền của tài khoản đang đăng nhập.');
      return;
    }
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    Alert.alert(
      'Xác nhận',
      `Đổi quyền ${user.username} thành ${newRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              await updateUserRole(user.id, newRole);
              await loadUsers();
            } catch (error) {
              console.error('updateUserRole error:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật quyền người dùng.');
            }
          },
        },
      ],
    );
  };

  const removeUser = (id: number) => {
    if (id === currentUser?.id) {
      Alert.alert('Không thể xóa', 'Bạn không thể xóa tài khoản đang đăng nhập.');
      return;
    }
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa người dùng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(id);
            await loadUsers();
          } catch (error) {
            console.error('deleteUser error:', error);
            Alert.alert('Lỗi', 'Không thể xóa người dùng.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={<Text>Chưa có người dùng.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.username}</Text>
            <Text>Quyền: {item.role}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => changeRole(item)}
            >
              <Text style={styles.buttonText}>Đổi quyền</Text>
            </TouchableOpacity>

            {item.id !== currentUser?.id && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeUser(item.id)}
              >
                <Text style={styles.buttonText}>Xóa người dùng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  item: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  name: { fontSize: 17, fontWeight: 'bold' },
  button: {
    backgroundColor: '#1976D2',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
  },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default UserManagement;