
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { fetchCart, checkout, type CartItem } from './database';
import { getCurrentUser } from './auth';

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' đ';

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const user = getCurrentUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const data = await fetchCart(user.id);
    setItems(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.id]),
  );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const confirmOrder = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập trước.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng đang trống.');
      return;
    }

    setLoading(true);
    const success = await checkout(user.id);
    setLoading(false);

    if (success) {
      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        {
          text: 'Xem lịch sử mua hàng',
          onPress: () => navigation.navigate('OrderHistoryScreen'),
        },
      ]);
    } else {
      Alert.alert('Thất bại', 'Không thể đặt hàng. Vui lòng thử lại.');
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Vui lòng đăng nhập để đặt hàng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác nhận đơn hàng</Text>

      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={<Text>Không có sản phẩm trong giỏ hàng.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>
              {item.quantity} x {formatPrice(item.price)}
            </Text>
            <Text style={styles.price}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Tổng thanh toán: {formatPrice(total)}</Text>

        <TouchableOpacity
          style={[styles.button, (loading || items.length === 0) && styles.disabled]}
          disabled={loading || items.length === 0}
          onPress={confirmOrder}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  price: { color: '#E53935', marginTop: 5 },
  footer: { paddingTop: 15 },
  total: { fontSize: 18, fontWeight: 'bold' },
  button: {
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
});

export default CheckoutScreen;
