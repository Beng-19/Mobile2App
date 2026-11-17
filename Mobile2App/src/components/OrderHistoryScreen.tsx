import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchOrders,
  fetchOrderItems,
  type Order,
  type OrderItem,
} from './database';
import { getCurrentUser } from './auth';
import { getOrderItemImage } from './orderItemImage';

type OrderWithItems = Order & { items: OrderItem[] };

const OrderItemImage = ({
  image,
  name,
}: {
  image: string | null | undefined;
  name: string;
}) => {
  const [failed, setFailed] = useState(false);
  const source = failed
    ? getOrderItemImage(undefined, name)
    : getOrderItemImage(image, name);

  if (!source) {
    return (
      <View style={[styles.itemImage, styles.imagePlaceholder]}>
        <Text style={styles.placeholderIcon}>🛍️</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={styles.itemImage}
      resizeMode="contain"
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
};

const formatPrice = (price: number) =>
  Number(price).toLocaleString('vi-VN') + ' đ';

const OrderHistoryScreen = () => {
  const user = getCurrentUser();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const orderData = await fetchOrders(user.id);
      const ordersWithItems = await Promise.all(
        orderData.map(async order => ({
          ...order,
          items: await fetchOrderItems(order.id),
        })),
      );
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('loadOrders error:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử mua hàng.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#DF594D" />
          <Text style={styles.muted}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.empty}>Bạn chưa có đơn hàng nào.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.order}>
              <Text style={styles.orderTitle}>Mã đơn: #{item.id}</Text>
              <Text style={styles.meta}>
                Ngày đặt: {new Date(item.createdAt).toLocaleString('vi-VN')}
              </Text>
              {item.recipientName ? (
                <Text style={styles.meta}>Người nhận: {item.recipientName}</Text>
              ) : null}
              {item.recipientPhone ? (
                <Text style={styles.meta}>Điện thoại: {item.recipientPhone}</Text>
              ) : null}
              {item.recipientAddress ? (
                <Text style={styles.meta}>Địa chỉ: {item.recipientAddress}</Text>
              ) : null}
              <Text style={styles.meta}>
                Thanh toán: {item.paymentMethod || 'COD'}
              </Text>
              <Text style={styles.meta}>Trạng thái: {item.status}</Text>

              <View style={styles.items}>
                {item.items.length ? (
                  item.items.map(orderItem => {
                    return (
                      <View key={orderItem.id} style={styles.itemRow}>
                        <OrderItemImage
                          image={orderItem.img}
                          name={orderItem.name}
                        />
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{orderItem.name}</Text>
                          <Text style={styles.meta}>
                            Đơn giá: {formatPrice(orderItem.price)}
                          </Text>
                          <Text style={styles.meta}>
                            Số lượng: {orderItem.quantity}
                          </Text>
                          <Text style={styles.lineTotal}>
                            Thành tiền:{' '}
                            {formatPrice(
                              Number(orderItem.price) * Number(orderItem.quantity),
                            )}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.muted}>
                    Đơn hàng không có chi tiết sản phẩm.
                  </Text>
                )}
              </View>

              <Text style={styles.total}>
                Tổng tiền: {formatPrice(item.total)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
  muted: { color: '#777', marginTop: 8 },
  order: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  orderTitle: { fontWeight: 'bold', fontSize: 17, marginBottom: 8 },
  meta: { color: '#555', marginTop: 4 },
  items: { marginTop: 12, borderTopWidth: 1, borderColor: '#eee' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    marginRight: 12,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', color: '#222', marginBottom: 2 },
  lineTotal: { color: '#E53935', fontWeight: '600', marginTop: 4 },
  total: { fontWeight: 'bold', color: '#E53935', marginTop: 12 },
});

export default OrderHistoryScreen;
