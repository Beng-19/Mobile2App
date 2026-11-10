
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeStackScreen from './HomeStackScreen';
import SignupSqlite from './SignupSqlite';
import LoginSqlite from './LoginSqlite';
import AdminStackScreen from './admin/AdminStackScreen';

export type RootTabParamList = {
  HomeTab: undefined;
  AdminTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#777',
      }}
    >
      {/* Trang chủ người dùng */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⌂</Text>
          ),
        }}
      />

      {/* Trang quản trị */}
      <Tab.Screen
        name="AdminTab"
        component={AdminStackScreen}
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⚙</Text>
          ),
        }}
      />

      {/* Đăng ký */}
      <Tab.Screen
        name="SignupSqlite"
        component={SignupSqlite}
        options={{
          title: 'Đăng ký',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>＋</Text>
          ),
        }}
      />

      {/* Đăng nhập */}
      <Tab.Screen
        name="LoginSqlite"
        component={LoginSqlite}
        options={{
          title: 'Đăng nhập',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⇥</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
