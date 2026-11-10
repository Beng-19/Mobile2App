
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchOrders,
  fetchOrderItems,
  type Order,
  type OrderItem,
} from './database';
import { getCurrentUser } from './auth';

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' đ';

const OrderHistoryScreen = () => {
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const loadOrders = async () => {
    if (!user) return;
    const data = await fetchOrders(user.id);
    setOrders(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [user?.id]),
  );

  const showDetails = async (orderId: number) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      setOrderItems([]);
      return;
    }

    const data = await fetchOrderItems(orderId);
    setOrderItems(data);
    setSelectedOrder(orderId);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Vui lòng đăng nhập để xem lịch sử mua hàng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử mua hàng</Text>

      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>Bạn chưa có đơn hàng nào.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.order}>
            <Text style={styles.orderTitle}>Đơn hàng #{item.id}</Text>
            <Text>Ngày đặt: {item.createdAt}</Text>
            <Text>Trạng thái: {item.status}</Text>
            <Text style={styles.total}>
              Tổng tiền: {formatPrice(item.total)}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => showDetails(item.id)}
            >
              <Text style={styles.buttonText}>
                {selectedOrder === item.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </Text>
            </TouchableOpacity>

            {selectedOrder === item.id && (
              <View style={styles.detail}>
                {orderItems.map(product => (
                  <View key={product.id} style={styles.detailRow}>
                    <Text style={{ flex: 1 }}>{product.name}</Text>
                    <Text>
                      {product.quantity} x {formatPrice(product.price)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
  order: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  orderTitle: { fontWeight: 'bold', fontSize: 17, marginBottom: 8 },
  total: { fontWeight: 'bold', color: '#E53935', marginTop: 6 },
  button: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff' },
  detail: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
});

export default OrderHistoryScreen;
