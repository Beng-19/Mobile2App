
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Category,
  Product,
  fetchCategories,
  fetchProductsByCategory,
  addToCart,
  getCurrentUser,
} from './database';
import CategorySelector from './CategorySelector';
import SanphamSqlite from './SanphamSqlite';

const ProductsByCategoryScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const initialCategoryId = Number(route.params?.categoryId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number>(initialCategoryId);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await fetchProductsByCategory(id);
      setProducts(result);
    } catch (error) {
      console.log('Lỗi tải sản phẩm:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);

        setSelectedId(initialCategoryId);
        await loadProducts(initialCategoryId);
      } catch (error) {
        console.log('Lỗi tải danh mục:', error);
        setLoading(false);
      }
    };

    load();
  }, [initialCategoryId, loadProducts]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    loadProducts(id);
  };

  const handleBuy = async (productName: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        Alert.alert(
          'Thông báo',
          'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.'
        );
        return;
      }

      const product = products.find(
        (item) => item.name === productName
      );

      if (!product) return;

      await addToCart(user.id, product.id);

      Alert.alert('Thành công', `Đã thêm ${productName} vào giỏ hàng.`);
    } catch (error) {
      console.log('Lỗi thêm giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh mục sản phẩm</Text>

      <CategorySelector
        categories={categories}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <Text style={styles.subtitle}>
        {categories.find((item) => item.id === selectedId)?.name ?? 'Sản phẩm'}
      </Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SanphamSqlite
              item={item}
              onBuy={handleBuy}
              onPressDetail={(product) =>
                navigation.navigate('ProductDetail', { product })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Danh mục này chưa có sản phẩm.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ProductsByCategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    margin: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#777',
  },
});
