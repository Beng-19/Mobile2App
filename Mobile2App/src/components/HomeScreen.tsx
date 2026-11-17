
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
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// import {
//   fetchProducts,
//   fetchCategories,
//   addToCart,
//   getCurrentUser,
//   Product,
//   Category,
// } from './database';
import {
  fetchProducts,
  fetchCategories,
  addToCart,
  Product,
  Category,
} from './database';

import { getCurrentUser } from './auth';

import Header from './Header';
import SanphamSqlite from './SanphamSqlite';
import CategorySelector from './CategorySelector';
import {
  filterProducts,
  PRICE_FILTER_OPTIONS,
  type PriceFilterId,
} from './productFilters';

const bannerImage = require('./assets/images/balo.png');

const HomeScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [search, setSearch] = useState('');
  const [priceFilterId, setPriceFilterId] = useState<PriceFilterId>('all');
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

  // Tìm kiếm theo tên, danh mục và lọc khoảng giá
  const filteredProducts = useMemo(() => {
    return filterProducts(products, categories, search, priceFilterId);
  }, [products, categories, search, priceFilterId]);

  // Thêm sản phẩm vào giỏ hàng
  const handleAddCart = async (product: Product) => {
    const user = getCurrentUser();

    if (!user) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
      );
      return;
    }

    try {
      await addToCart(user.id, product.id);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.log('Lỗi thêm giỏ hàng:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng',
      );
    }
  };

  // Mở chi tiết sản phẩm
  const handleDetail = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
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
            SHOP BÈNG
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

      {categories.length ? (
        <CategorySelector
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={categoryId => {
            setSelectedCategoryId(categoryId);
            const category = categories.find(item => item.id === categoryId);
            if (!category) return;
            navigation.navigate('ProductsByCategory', {
              categoryId: category.id,
              categoryName: category.name,
            });
          }}
        />
      ) : (
        <Text style={styles.emptyCategory}>
          Chưa có danh mục sản phẩm
        </Text>
      )}

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

      <View style={styles.shortcutRow}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartScreen')}
        >
          <Text style={styles.cartButtonText}>🛒 Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('OrderHistoryScreen')}
        >
          <Text style={styles.cartButtonText}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.cartButtonText}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>

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
          Lọc theo giá
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceOptions}
        >
          {PRICE_FILTER_OPTIONS.map(option => {
            const selected = option.id === priceFilterId;
            return (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                activeOpacity={0.8}
                style={[styles.priceOption, selected && styles.selectedPriceOption]}
                onPress={() => setPriceFilterId(option.id)}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.priceOptionText,
                    selected && styles.selectedPriceOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  shortcutRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 10,
  },
  cartButton: {
  flex: 1,
  backgroundColor: '#FFF0F0',
  marginHorizontal: 4,
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
},

cartButtonText: {
  color: '#E53935',
  fontWeight: 'bold',
  fontSize: 14,
},
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

  priceOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },

  priceOption: {
    height: 38,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 19,
    marginRight: 8,
  },

  selectedPriceOption: {
    backgroundColor: '#E53935',
  },

  priceOptionText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedPriceOptionText: {
    color: '#fff',
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

  emptyCategory: {
    color: '#888',
    marginHorizontal: 16,
    fontSize: 12,
    marginVertical: 8,
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
