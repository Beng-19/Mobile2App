
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Category, Product, fetchCategories } from './database';
import CategorySelector from './CategorySelector';

const productImages: Record<string, ImageSourcePropType> = {
  'ao.png': require('./assets/images/ao.png'),
  'balo.png': require('./assets/images/balo.png'),
  'giay.png': require('./assets/images/giay.png'),
  'mu-luoi-trai.png': require('./assets/images/mu-luoi-trai.png'),
  'tui-xach.png': require('./assets/images/tui-xach.png'),
  'vi.png': require('./assets/images/vi.png'),
};

const getProductImage = (product: Product): ImageSourcePropType => {
  const img = product.img?.toLowerCase().trim() ?? '';

  if (img.startsWith('http')) {
    return { uri: product.img };
  }

  if (productImages[img]) {
    return productImages[img];
  }

  const name = product.name.toLowerCase();

  if (name.includes('balo')) return productImages['balo.png'];
  if (name.includes('giày')) return productImages['giay.png'];
  if (name.includes('mũ')) return productImages['mu-luoi-trai.png'];
  if (name.includes('túi')) return productImages['tui-xach.png'];
  if (name.includes('ví')) return productImages['vi.png'];

  return productImages['ao.png'];
};

const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const product: Product = route.params.product;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.log('Lỗi tải danh mục:', error);
      }
    };

    load();
  }, []);

  const category = categories.find(
    (item) => item.id === product.categoryId
  );

  const selectCategory = (categoryId: number) => {
    const selected = categories.find(
      (item) => item.id === categoryId
    );

    navigation.navigate('ProductsByCategory', {
      categoryId,
      categoryName: selected?.name ?? 'Danh mục',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Image
        source={getProductImage(product)}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.name}>{product.name}</Text>

      <Text style={styles.price}>
        {product.price.toLocaleString('vi-VN')} đ
      </Text>

      <Text style={styles.label}>
        Danh mục: {category?.name ?? 'Chưa xác định'}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Chọn danh mục sản phẩm
      </Text>

      <CategorySelector
        categories={categories}
        selectedId={product.categoryId}
        onSelect={selectCategory}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('ProductsByCategory', {
            categoryId: product.categoryId,
            categoryName: category?.name ?? 'Danh mục',
          })
        }
      >
        <Text style={styles.buttonText}>
          Xem sản phẩm cùng danh mục
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 14,
    backgroundColor: '#f7f7f7',
  },
  name: {
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#222',
  },
  price: {
    fontSize: 21,
    color: '#E53935',
    fontWeight: 'bold',
    marginTop: 8,
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  button: {
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
