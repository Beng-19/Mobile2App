
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  getUserByCredentials,
} from './database';

const LoginSqlite = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      const user = await getUserByCredentials(
        username.trim(),
        password,
      );

      if (!user) {
        Alert.alert(
          'Đăng nhập thất bại',
          'Tên đăng nhập hoặc mật khẩu không đúng',
        );
        return;
      }

      Alert.alert(
        'Thành công',
        `Xin chào ${user.username}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (user.role === 'admin') {
                navigation.navigate('AdminTab', {
                  screen: 'AdminDashboard',
                });
              } else {
                navigation.navigate('HomeTab');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ĐĂNG NHẬP</Text>

      <Text style={styles.subtitle}>
        Đăng nhập để sử dụng các chức năng của cửa hàng
      </Text>

      <Text style={styles.label}>Tên đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loading}
      />

      <Text style={styles.label}>Mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginSqlite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#E53935',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    marginBottom: 18,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
