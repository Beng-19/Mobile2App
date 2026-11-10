import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ProductDetailScreen from './ProductDetailScreen';
import ProductsByCategoryScreen from './ProductsByCategoryScreen';

const Stack = createNativeStackNavigator();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />

      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategoryScreen}
        options={{ title: 'Sản phẩm theo danh mục' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;