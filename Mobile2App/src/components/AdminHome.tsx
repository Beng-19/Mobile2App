
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import ProductSqlite from './ProductSqlite';
import CategoryManagement from './CategoryManagement';
import UserManagement from './UserManagement';

type ScreenName = 'home' | 'users' | 'categories' | 'products';

const AdminHome = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');

  if (currentScreen === 'users') {
    return <UserManagement onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'categories') {
    return <CategoryManagement onBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'products') {
    return <ProductSqlite onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ADMIN</Text>
        <Text style={styles.subtitle}>TRANG CHỦ QUẢN TRỊ</Text>
      </View>

      <Text style={styles.welcome}>Xin chào, Quản trị viên!</Text>
      <Text style={styles.description}>
        Vui lòng chọn chức năng bạn muốn quản lý.
      </Text>

      <TouchableOpacity
        style={[styles.menuButton, styles.userButton]}
        onPress={() => setCurrentScreen('users')}
      >
        <Text style={styles.menuIcon}>👥</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Quản lý user</Text>
          <Text style={styles.menuDescription}>
            Xem, đổi quyền và xóa tài khoản
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.categoryButton]}
        onPress={() => setCurrentScreen('categories')}
      >
        <Text style={styles.menuIcon}>📂</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Quản lý loại sản phẩm</Text>
          <Text style={styles.menuDescription}>
            Thêm, sửa, xóa danh mục sản phẩm
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuButton, styles.productButton]}
        onPress={() => setCurrentScreen('products')}
      >
        <Text style={styles.menuIcon}>🛍️</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Quản lý sản phẩm</Text>
          <Text style={styles.menuDescription}>
            Thêm, sửa, xóa thông tin sản phẩm
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>ADMIN MANAGEMENT SYSTEM</Text>
    </ScrollView>
  );
};

export default AdminHome;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 22,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  userButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
  },
  categoryButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#16a34a',
  },
  productButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#ea580c',
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  arrow: {
    fontSize: 27,
    color: '#777',
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 11,
    marginTop: 25,
  },
});
