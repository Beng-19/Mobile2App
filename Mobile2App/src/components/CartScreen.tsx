
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

import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  type CartItem,
} from './database';
import { getCurrentUser } from './auth';

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' đ';

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const user = getCurrentUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCart(user.id);
      setItems(data);
    } catch (error) {
      console.error('loadCart error:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart]),
  );

  const changeQuantity = async (item: CartItem, quantity: number) => {
    if (!user) return;
    try {
      await updateCartQuantity(user.id, item.id, quantity);
      await loadCart();
    } catch (error) {
      console.error('changeQuantity error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng sản phẩm.');
    }
  };

  const deleteItem = (id: number) => {
    Alert.alert('Xóa sản phẩm', 'Bạn muốn xóa sản phẩm này khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          try {
            await removeFromCart(user.id, id);
            await loadCart();
          } catch (error) {
            console.error('removeFromCart error:', error);
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng.');
          }
        },
      },
    ]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Vui lòng đăng nhập để xem giỏ hàng.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginSqlite')}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng của tôi</Text>

      {loading ? (
        <Text>Đang tải giỏ hàng...</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.empty}>Giỏ hàng đang trống.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{formatPrice(item.price)}</Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => changeQuantity(item, item.quantity - 1)}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantity}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => changeQuantity(item, item.quantity + 1)}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.itemActions}>
                <Text style={styles.price}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Text style={styles.delete}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.total}>Tổng tiền: {formatPrice(total)}</Text>
        <TouchableOpacity
          style={[styles.button, items.length === 0 && styles.disabled]}
          disabled={items.length === 0}
          onPress={() => navigation.navigate('CheckoutScreen')}
        >
          <Text style={styles.buttonText}>Tiến hành thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
  item: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  itemInfo: { flex: 1 },
  itemActions: { alignItems: 'flex-end' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  price: { color: '#E53935', fontWeight: 'bold' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  smallButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  quantity: { marginHorizontal: 15 },
  delete: { color: 'red', marginTop: 12 },
  footer: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 14 },
  total: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  button: {
    backgroundColor: '#E53935',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  disabled: { opacity: 0.4 },
});

export default CartScreen;
