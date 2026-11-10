
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { Product } from './database';

type SanphamProps = {
  item: Product;
  onBuy: (productName: string) => void;
  onPressDetail: (product: Product) => void;
};

// Ảnh sản phẩm lưu trong src/components/assets/images
const productImages: Record<string, ImageSourcePropType> = {
  'ao.png': require('./assets/images/ao.png'),
  'balo.png': require('./assets/images/balo.png'),
  'giay.png': require('./assets/images/giay.png'),
  'mu-luoi-trai.png': require('./assets/images/mu-luoi-trai.png'),
  'tui-xach.png': require('./assets/images/tui-xach.png'),
  'vi.png': require('./assets/images/vi.png'),
};

const getProductImage = (item: Product): ImageSourcePropType | { uri: string } => {
  // Nếu database lưu ảnh bằng URL thì sử dụng URL
  if (item.img && /^https?:\/\//i.test(item.img)) {
    return { uri: item.img };
  }

  // Nếu database lưu tên file ảnh
  const imageName = item.img
    ? item.img.split('/').pop()?.toLowerCase()
    : '';

  if (imageName && productImages[imageName]) {
    return productImages[imageName];
  }

  // Nếu chưa có tên ảnh, tự nhận diện theo tên sản phẩm
  const name = item.name.toLowerCase();

  if (name.includes('balo')) return productImages['balo.png'];
  if (name.includes('mũ') || name.includes('mu ')) {
    return productImages['mu-luoi-trai.png'];
  }
  if (name.includes('túi') || name.includes('tui')) {
    return productImages['tui-xach.png'];
  }
  if (name.includes('giày') || name.includes('giay')) {
    return productImages['giay.png'];
  }
  if (name.includes('ví') || name.includes('vi ')) {
    return productImages['vi.png'];
  }
  if (name.includes('áo') || name.includes('ao ')) {
    return productImages['ao.png'];
  }

  // Ảnh mặc định nếu chưa xác định được sản phẩm
  return productImages['ao.png'];
};

const SanphamSqlite = ({
  item,
  onBuy,
  onPressDetail,
}: SanphamProps) => {
  const imageSource = getProductImage(item);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPressDetail(item)}
        style={styles.imageButton}
      >
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.detailLabel}>
          <Text style={styles.detailLabelText}>Xem chi tiết</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.price}>
          {Number(item.price).toLocaleString('vi-VN')} đ
        </Text>

        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.8}
          onPress={() => onBuy(item.name)}
        >
          <Text style={styles.buyButtonText}>+ Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SanphamSqlite;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 3,
  },

  imageButton: {
    width: '100%',
    height: 145,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  image: {
    width: '90%',
    height: '90%',
  },

  detailLabel: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  detailLabelText: {
    fontSize: 10,
    color: '#666666',
  },

  info: {
    padding: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252525',
    minHeight: 38,
  },

  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 5,
    marginBottom: 10,
  },

  buyButton: {
    backgroundColor: '#E53935',
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },

  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
