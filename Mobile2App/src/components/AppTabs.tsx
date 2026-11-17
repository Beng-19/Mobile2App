
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeStackScreen from './HomeStackScreen';
import SignupSqlite from './SignupSqlite';
import LoginSqlite from './LoginSqlite';
import AdminStackScreen from './admin/AdminStackScreen';
import { getCurrentUser, subscribeAuth } from './auth';

export type RootTabParamList = {
  HomeTab: undefined;
  AdminTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppTabs = () => {
  const [isAdmin, setIsAdmin] = useState(
    getCurrentUser()?.role === 'admin',
  );

  useEffect(() => {
    const unsubscribe = subscribeAuth(user => {
      setIsAdmin(user?.role === 'admin');
    });

    return unsubscribe;
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#777',
      }}
    >
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

      {isAdmin && (
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
      )}

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
