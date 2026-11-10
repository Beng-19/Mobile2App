
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';
import ProductManagement from './ProductManagement';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  CategoryManagement: undefined;
  ProductManagement: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: true,
        headerTintColor: '#E53935',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Trang quản trị' }}
      />

      <Stack.Screen
        name="UserManagement"
        component={UserManagement}
        options={{ title: 'Quản lý người dùng' }}
      />

      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagement}
        options={{ title: 'Quản lý danh mục' }}
      />

      <Stack.Screen
        name="ProductManagement"
        component={ProductManagement}
        options={{ title: 'Quản lý sản phẩm' }}
      />
    </Stack.Navigator>
  );
};

export default AdminStackScreen;
