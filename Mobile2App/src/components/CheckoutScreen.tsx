import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  checkout,
  fetchCart,
  fetchUserProfile,
  type CartItem,
} from './database';
import { getCurrentUser } from './auth';

const formatPrice = (price: number) => price.toLocaleString('vi-VN') + ' đ';

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const user = getCurrentUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | null>('COD');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const [cart, profile] = await Promise.all([
        fetchCart(user.id),
        fetchUserProfile(user.id),
      ]);
      setItems(cart);
      if (profile) {
        setRecipientName(current => current || profile.fullName || '');
        setRecipientPhone(current => current || profile.phone || '');
        setRecipientAddress(current => current || profile.address || '');
      }
    } catch (error) {
      console.error('checkout load error:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng hoặc thông tin giao hàng.');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  const confirmOrder = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập trước.');
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Thiếu phương thức thanh toán', 'Vui lòng chọn phương thức thanh toán.');
      return;
    }
    if (!/^[0-9+()\-\s]{8,20}$/.test(recipientPhone.trim())) {
      Alert.alert('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra lại số điện thoại.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng đang trống.');
      return;
    }

    try {
      setLoading(true);
      const success = await checkout(user.id, {
        recipientName,
        recipientPhone,
        recipientAddress,
        paymentMethod,
      });

      if (!success) {
        Alert.alert('Thất bại', 'Không thể đặt hàng. Giỏ hàng của bạn vẫn được giữ lại.');
        return;
      }

      setItems([]);
      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        {
          text: 'Xem lịch sử mua hàng',
          onPress: () => navigation.navigate('OrderHistoryScreen'),
        },
        { text: 'Tiếp tục mua sắm', onPress: () => navigation.navigate('HomeScreen') },
      ]);
    } catch (error) {
      console.error('confirmOrder error:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể đặt hàng. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.bodyText}>Vui lòng đăng nhập để đặt hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Thanh toán</Text>
      <Text style={styles.subtitle}>Nhập thông tin nhận hàng để hoàn tất đơn.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
        <TextInput
          style={styles.input}
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Họ và tên người nhận"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, styles.address]}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder="Địa chỉ giao hàng"
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <TouchableOpacity
          style={styles.paymentOption}
          activeOpacity={0.8}
          onPress={() => setPaymentMethod('COD')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'COD' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentCopy}>
            <Text style={styles.paymentTitle}>Thanh toán khi nhận hàng (COD)</Text>
            <Text style={styles.muted}>Thanh toán trực tiếp khi đơn được giao.</Text>
          </View>
          <Text style={styles.selectedLabel}>{paymentMethod === 'COD' ? 'Đã chọn' : 'Chọn'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sản phẩm ({items.length})</Text>
        {items.length === 0 ? (
          <Text style={styles.muted}>Không có sản phẩm trong giỏ hàng.</Text>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemCopy}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.muted}>
                  {item.quantity} x {formatPrice(item.price)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || items.length === 0 || !paymentMethod) && styles.disabled]}
        disabled={loading || items.length === 0 || !paymentMethod}
        onPress={confirmOrder}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đặt hàng - {formatPrice(total)}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { padding: 16, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#222', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#777', fontSize: 14, marginTop: 5, marginBottom: 15 },
  bodyText: { color: '#555', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#ECEDEF',
  },
  sectionTitle: { color: '#252525', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E4E5E7',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 10,
    color: '#222',
  },
  address: { minHeight: 75, textAlignVertical: 'top', marginBottom: 0 },
  paymentOption: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E45B50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E45B50' },
  paymentCopy: { flex: 1, marginLeft: 10 },
  paymentTitle: { color: '#333', fontSize: 13, fontWeight: '600' },
  selectedLabel: { color: '#E45B50', fontSize: 11, fontWeight: '700' },
  muted: { color: '#858585', fontSize: 12, marginTop: 4 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemCopy: { flex: 1, paddingRight: 10 },
  itemName: { color: '#333', fontSize: 14, fontWeight: '600' },
  itemPrice: { color: '#444', fontSize: 13, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
  },
  totalLabel: { color: '#333', fontWeight: '600' },
  total: { color: '#D94E43', fontSize: 17, fontWeight: '700' },
  button: {
    backgroundColor: '#DF594D',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    marginTop: 2,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});

export default CheckoutScreen;
