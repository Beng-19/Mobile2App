
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchAllOrders,
  fetchOrderItems,
  updateOrderStatus,
  type AdminOrder,
  type OrderItem,
} from '../database';

import { getCurrentUser } from '../auth';

const STATUSES = [
  'Đã đặt hàng',
  'Đang xử lý',
  'Đang giao',
  'Đã giao',
  'Đã hủy',
];

const formatPrice = (price: number) =>
  Number(price || 0).toLocaleString('vi-VN') + ' đ';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const user = getCurrentUser();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'admin') {
        loadOrders();
      } else {
        setLoading(false);
      }
    }, [user?.role, loadOrders]),
  );

  const showDetails = async (orderId: number) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      setOrderItems([]);
      return;
    }

    try {
      const data = await fetchOrderItems(orderId);
      setOrderItems(data);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng.');
    }
  };

  const handleUpdateStatus = (
    orderId: number,
    status: string,
  ) => {
    Alert.alert(
      'Xác nhận cập nhật',
      `Bạn muốn chuyển đơn hàng #${orderId} sang trạng thái "${status}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setUpdatingId(orderId);

              await updateOrderStatus(orderId, status);

              setOrders(previous =>
                previous.map(order =>
                  order.id === orderId
                    ? { ...order, status }
                    : order,
                ),
              );

              Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng.');
            } catch (error) {
              console.error(error);
              Alert.alert('Lỗi', 'Không thể cập nhật đơn hàng.');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          Bạn cần đăng nhập bằng tài khoản Admin.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QUẢN LÝ ĐƠN HÀNG</Text>

      <Text style={styles.subtitle}>
        Tổng số đơn hàng: {orders.length}
      </Text>

      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có đơn hàng nào.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>
              Đơn hàng #{item.id}
            </Text>

            <Text style={styles.info}>
              Tài khoản: {item.username || 'Không xác định'}
            </Text>

            {item.recipientName || item.fullName ? (
              <Text style={styles.info}>
                Người nhận: {item.recipientName || item.fullName}
              </Text>
            ) : null}

            {item.recipientPhone || item.phone ? (
              <Text style={styles.info}>
                Số điện thoại: {item.recipientPhone || item.phone}
              </Text>
            ) : null}

            {item.recipientAddress || item.address ? (
              <Text style={styles.info}>
                Địa chỉ: {item.recipientAddress || item.address}
              </Text>
            ) : null}

            <Text style={styles.info}>
              Thanh toán: {item.paymentMethod || 'COD'}
            </Text>

            <Text style={styles.info}>
              Ngày đặt: {item.createdAt}
            </Text>

            <Text style={styles.total}>
              Tổng tiền: {formatPrice(item.total)}
            </Text>

            <Text style={styles.status}>
              Trạng thái hiện tại: {item.status}
            </Text>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => showDetails(item.id)}
            >
              <Text style={styles.detailButtonText}>
                {selectedOrder === item.id
                  ? 'Ẩn chi tiết'
                  : 'Xem chi tiết đơn hàng'}
              </Text>
            </TouchableOpacity>

            {selectedOrder === item.id && (
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>
                  Sản phẩm trong đơn
                </Text>

                {orderItems.length === 0 ? (
                  <Text style={styles.info}>
                    Không có sản phẩm trong đơn hàng.
                  </Text>
                ) : (
                  orderItems.map(product => (
                    <View
                      key={product.id}
                      style={styles.productRow}
                    >
                      <Text style={styles.productName}>
                        {product.name}
                      </Text>

                      <Text style={styles.productPrice}>
                        {product.quantity} x {formatPrice(product.price)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            <Text style={styles.statusTitle}>
              Cập nhật trạng thái đơn hàng:
            </Text>

            <View style={styles.statusList}>
              {STATUSES.map(status => (
                <TouchableOpacity
                  key={status}
                  disabled={
                    item.status === status ||
                    updatingId === item.id
                  }
                  style={[
                    styles.statusButton,
                    item.status === status && styles.activeStatus,
                  ]}
                  onPress={() =>
                    handleUpdateStatus(item.id, status)
                  }
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      item.status === status &&
                        styles.activeStatusText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {updatingId === item.id && (
              <Text style={styles.loadingText}>
                Đang cập nhật...
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 6,
  },
  subtitle: {
    color: '#777',
    marginBottom: 14,
  },
  list: {
    paddingBottom: 25,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  info: {
    color: '#555',
    fontSize: 13,
    marginBottom: 6,
  },
  total: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  status: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 9,
  },
  detailButton: {
    backgroundColor: '#333',
    padding: 11,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 12,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  detailBox: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  detailTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  productName: {
    flex: 1,
    color: '#444',
    marginRight: 8,
  },
  productPrice: {
    color: '#444',
    fontSize: 12,
  },
  statusTitle: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 9,
    color: '#333',
  },
  statusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 7,
  },
  activeStatus: {
    backgroundColor: '#E53935',
  },
  statusButtonText: {
    color: '#E53935',
    fontSize: 11,
  },
  activeStatusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#777',
    marginTop: 10,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default AdminOrderManagement;
