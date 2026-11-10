
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchProducts,
  fetchCategories,
  addToCart,
  getCurrentUser,
  Product,
  Category,
} from './database';

import Header from './Header';
import SanphamSqlite from './SanphamSqlite';

const bannerImage = require('./assets/images/balo.png');

const HomeScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu sản phẩm và danh mục
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [productData, categoryData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
    } catch (error) {
      console.log('Lỗi tải dữ liệu:', error);
      Alert.alert('Thông báo', 'Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Chuẩn hóa tiếng Việt để tìm kiếm không phân biệt dấu
  const normalizeText = (value: string): string => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();
  };

  // Tìm kiếm theo tên, danh mục và lọc khoảng giá
  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(search);

    const min =
      minPrice.trim() !== '' ? Number(minPrice) : null;

    const max =
      maxPrice.trim() !== '' ? Number(maxPrice) : null;

    return products.filter(product => {
      const category = categories.find(
        item => item.id === product.categoryId,
      );

      const productName = normalizeText(product.name);
      const categoryName = normalizeText(category?.name || '');

      const matchSearch =
        keyword === '' ||
        productName.includes(keyword) ||
        categoryName.includes(keyword);

      const matchMin =
        min === null ||
        (Number.isFinite(min) && product.price >= min);

      const matchMax =
        max === null ||
        (Number.isFinite(max) && product.price <= max);

      return matchSearch && matchMin && matchMax;
    });
  }, [products, categories, search, minPrice, maxPrice]);

  // Xóa tất cả bộ lọc
  const handleResetFilter = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddCart = async (productName: string) => {
    const user = getCurrentUser();

    if (!user) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
      );
      return;
    }

    const product = products.find(
      item => item.name === productName,
    );

    if (!product) {
      Alert.alert('Thông báo', 'Không tìm thấy sản phẩm');
      return;
    }

    try {
      await addToCart(user.id, product.id);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.log('Lỗi thêm giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Mở chi tiết sản phẩm
  const handleDetail = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  // Biểu tượng danh mục
  const getCategoryIcon = (name: string) => {
    const value = normalizeText(name);

    if (value.includes('ao')) return '👕';
    if (value.includes('giay')) return '👟';
    if (value.includes('balo')) return '🎒';
    if (value.includes('mu')) return '🧢';
    if (value.includes('tui')) return '👜';

    return '🛍️';
  };

  // Phần đầu danh sách sản phẩm
  const renderHeader = () => (
    <View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeSmall}>
          XIN CHÀO BẠN 👋
        </Text>

        <Text style={styles.welcomeTitle}>
          Khám phá sản phẩm yêu thích
        </Text>

        <Text style={styles.welcomeDescription}>
          Mua sắm dễ dàng, lựa chọn thật phong cách.
        </Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerSmall}>
            ƯU ĐÃI ĐẶC BIỆT
          </Text>

          <Text style={styles.bannerTitle}>
            SHOP APP
          </Text>

          <Text style={styles.bannerDescription}>
            Khám phá bộ sưu tập mới ngay hôm nay!
          </Text>

          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>
              MUA SẮM NGAY
            </Text>
          </View>
        </View>

        <Image source={bannerImage} style={styles.bannerImage} />
      </View>

      {/* Danh mục */}
      <Text style={styles.sectionTitle}>
        Danh mục sản phẩm
      </Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.category}
            onPress={() =>
              navigation.navigate('ProductsByCategory', {
                categoryId: item.id,
                categoryName: item.name,
              })
            }
          >
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(item.name)}
            </Text>

            <Text
              style={styles.categoryName}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyCategory}>
            Chưa có danh mục sản phẩm
          </Text>
        }
      />

      {/* Tiêu đề sản phẩm */}
      <View style={styles.sectionRow}>
        <View>
          <Text style={styles.sectionTitle}>
            Sản phẩm nổi bật
          </Text>

          <Text style={styles.sectionSubtitle}>
            Lựa chọn dành cho bạn
          </Text>
        </View>

        <Text style={styles.productCount}>
          {filteredProducts.length} sản phẩm
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />

      {/* Tìm kiếm */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên sản phẩm hoặc danh mục..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lọc khoảng giá */}
      <View style={styles.priceFilter}>
        <Text style={styles.filterTitle}>
          Lọc sản phẩm theo khoảng giá (VNĐ)
        </Text>

        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Giá thấp nhất"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />

          <Text style={styles.priceSeparator}>-</Text>

          <TextInput
            style={styles.priceInput}
            placeholder="Giá cao nhất"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />

          <TouchableOpacity
            style={styles.resetFilter}
            onPress={handleResetFilter}
          >
            <Text style={styles.resetFilterText}>
              Xóa
            </Text>
          </TouchableOpacity>
        </View>

        {minPrice !== '' &&
          maxPrice !== '' &&
          Number(minPrice) > Number(maxPrice) && (
            <Text style={styles.errorText}>
              Giá thấp nhất không được lớn hơn giá cao nhất.
            </Text>
          )}
      </View>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color="#E53935"
          />
          <Text style={styles.loadingText}>
            Đang tải sản phẩm...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <SanphamSqlite
              item={item}
              onBuy={handleAddCart}
              onPressDetail={handleDetail}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛍️</Text>

              <Text style={styles.emptyTitle}>
                Không tìm thấy sản phẩm
              </Text>

              <Text style={styles.emptyDescription}>
                Hãy thử thay đổi từ khóa hoặc khoảng giá.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeScreen;

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 5,
    paddingHorizontal: 13,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  searchIcon: {
    fontSize: 25,
    color: '#888',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    paddingVertical: 0,
  },

  clearSearch: {
    color: '#888',
    fontSize: 17,
    padding: 5,
  },

  priceFilter: {
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 8,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 10,
    color: '#222',
    fontSize: 12,
  },

  priceSeparator: {
    marginHorizontal: 7,
    color: '#888',
  },

  resetFilter: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
    borderRadius: 9,
    marginLeft: 7,
  },

  resetFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  errorText: {
    color: '#E53935',
    fontSize: 11,
    marginTop: 5,
  },

  welcome: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 13,
  },

  welcomeSmall: {
    color: '#E53935',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 5,
  },

  welcomeDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },

  banner: {
    marginHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#E53935',
    borderRadius: 15,
    minHeight: 145,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },

  bannerContent: {
    flex: 1,
    padding: 15,
  },

  bannerSmall: {
    color: '#FFE0E0',
    fontSize: 10,
    fontWeight: 'bold',
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
  },

  bannerDescription: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 5,
  },

  bannerTag: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    marginTop: 10,
  },

  bannerTagText: {
    color: '#E53935',
    fontSize: 10,
    fontWeight: 'bold',
  },

  bannerImage: {
    width: 112,
    height: 125,
    marginRight: 8,
    resizeMode: 'contain',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 5,
  },

  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  category: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 82,
    height: 82,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 1,
  },

  categoryIcon: {
    fontSize: 26,
    marginBottom: 5,
  },

  categoryName: {
    color: '#444',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 3,
  },

  emptyCategory: {
    color: '#888',
    marginHorizontal: 16,
    fontSize: 12,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 16,
    marginBottom: 8,
  },

  sectionSubtitle: {
    color: '#999',
    fontSize: 11,
    marginHorizontal: 16,
    marginTop: 2,
  },

  productCount: {
    color: '#999',
    fontSize: 11,
    marginTop: 12,
  },

  productList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  productRow: {
    justifyContent: 'space-between',
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#888',
    marginTop: 10,
  },

  empty: {
    alignItems: 'center',
    padding: 30,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },

  emptyDescription: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
