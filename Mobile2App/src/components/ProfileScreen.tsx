
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchUserProfile,
  updateUserProfile,
  type UserProfile,
} from './database';
import { getCurrentUser } from './auth';

const ProfileScreen = () => {
  const user = getCurrentUser();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (!user) return;

    const profile = await fetchUserProfile(user.id);

    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    } else {
      setFullName('');
      setPhone('');
      setAddress('');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user?.id]),
  );

  const saveProfile = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ tên.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }

    const profile: UserProfile = {
      userId: user.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      setLoading(true);
      await updateUserProfile(profile);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Vui lòng đăng nhập để xem thông tin cá nhân.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>

      <Text style={styles.label}>Tên đăng nhập</Text>
      <TextInput
        style={[styles.input, styles.readonly]}
        value={user.username}
        editable={false}
      />

      <Text style={styles.label}>Họ và tên</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nhập họ và tên"
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput
        style={[styles.input, styles.address]}
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ"
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        disabled={loading}
        onPress={saveProfile}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang lưu...' : 'Lưu thông tin'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 7, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  readonly: { backgroundColor: '#eee', color: '#777' },
  address: { minHeight: 90, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 30,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ProfileScreen;
