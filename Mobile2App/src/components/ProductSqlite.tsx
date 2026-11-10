
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

import {
  initDatabase,
  fetchProducts,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
} from './database';

const ProductSqlite = ({ onBack }: { onBack?: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState('hinh1.jpg');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const start = async () => {
      await initDatabase();
      await loadData();
    };
    start();
  }, []);

  const loadData = async () => {
    try {
      const cats = await fetchCategories();
      const prods = await fetchProducts();
      setCategories(cats);
      setProducts([...prods].reverse());

      if (cats.length > 0 && !cats.some(c => c.id === categoryId)) {
        setCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sản phẩm.');
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setImageUri('hinh1.jpg');
    setCategoryId(categories[0]?.id ?? 1);
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    const productName = name.trim();
    const productPrice = Number(price);

    if (!productName || !price.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên và giá sản phẩm.');
      return;
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    if (categories.length === 0) {
      Alert.alert('Thông báo', 'Bạn cần tạo danh mục trước.');
      return;
    }

    const productData = {
      name: productName,
      price: productPrice,
      img: imageUri.trim() || 'hinh1.jpg',
      categoryId,
    };

    try {
      if (editingId !== null) {
        await updateProduct({ id: editingId, ...productData });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm.');
      } else {
        await addProduct(productData);
        Alert.alert('Thành công', 'Đã thêm sản phẩm.');
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Lỗi lưu sản phẩm:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
    }
  };

  const handleEdit = (item: Product) => {
    setName(item.name);
    setPrice(item.price.toString());
    setImageUri(item.img || 'hinh1.jpg');
    setCategoryId(item.categoryId);
    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              await loadData();
              if (editingId === id) resetForm();
            } catch (error) {
              console.error('Lỗi xóa sản phẩm:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
            }
          },
        },
      ],
    );
  };

  const getImageSource = (img: string) => {
    if (img && (img.startsWith('file://') || img.startsWith('content://'))) {
      return { uri: img };
    }

    if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
      return { uri: img };
    }

    return {
      uri: 'https://placehold.co/120x120/png?text=Product',
    };
  };

  const renderItem = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);

    return (
      <View style={styles.card}>
        <Image source={getImageSource(item.img)} style={styles.image} />

        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
          <Text style={styles.categoryText}>
            Danh mục: {category?.name ?? 'Chưa xác định'}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.buttonText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backText}>‹ Quay lại</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>QUẢN LÝ SẢN PHẨM</Text>
      </View>

      <ScrollView
        style={styles.formScroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>
          {editingId !== null ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập tên sản phẩm"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Nhập giá sản phẩm"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Tên ảnh hoặc đường dẫn ảnh"
          placeholderTextColor="#888"
          value={imageUri}
          onChangeText={setImageUri}
        />

        <Text style={styles.label}>Chọn loại sản phẩm:</Text>
        <View style={styles.categoryList}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                categoryId === category.id && styles.categorySelected,
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  categoryId === category.id && styles.categorySelectedText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleAddOrUpdate}
        >
          <Text style={styles.buttonText}>
            {editingId !== null ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM'}
          </Text>
        </TouchableOpacity>

        {editingId !== null && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.buttonText}>HỦY CHỈNH SỬA</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>

        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
          }
        />
      </ScrollView>
    </View>
  );
};

export default ProductSqlite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  formScroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#222',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  categorySelected: {
    backgroundColor: '#2563eb',
  },
  categoryButtonText: {
    color: '#2563eb',
  },
  categorySelectedText: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 13,
    borderRadius: 7,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 7,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: 95,
    height: 110,
    backgroundColor: '#eee',
  },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  productPrice: {
    color: '#e11d48',
    marginTop: 4,
  },
  categoryText: {
    color: '#666',
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 5,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
});
