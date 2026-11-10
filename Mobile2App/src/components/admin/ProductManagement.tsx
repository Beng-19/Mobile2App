
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchProducts,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type Category,
} from '../database';

const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN') + ' đ';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('hinh1.jpg');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    const productData = await fetchProducts();
    const categoryData = await fetchCategories();

    setProducts(productData);
    setCategories(categoryData);

    if (categoryData.length > 0 && categoryId === null) {
      setCategoryId(categoryData[0].id);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const resetForm = () => {
    setName('');
    setPrice('');
    setImg('hinh1.jpg');
    setEditingId(null);
  };

  const saveProduct = async () => {
    if (!name.trim() || !price.trim() || !categoryId) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin sản phẩm.');
      return;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    try {
      if (editingId !== null) {
        const product: Product = {
          id: editingId,
          name: name.trim(),
          price: numericPrice,
          img: img.trim() || 'hinh1.jpg',
          categoryId,
        };

        await updateProduct(product);
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm.');
      } else {
        await addProduct({
          name: name.trim(),
          price: numericPrice,
          img: img.trim() || 'hinh1.jpg',
          categoryId,
        });

        Alert.alert('Thành công', 'Đã thêm sản phẩm.');
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('saveProduct error:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
    }
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setImg(product.img || '');
    setCategoryId(product.categoryId);
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            await loadData();

            if (editingId === id) {
              resetForm();
            }
          } catch (error) {
            console.error('deleteProduct error:', error);
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
          }
        },
      },
    ]);
  };

  const getCategoryName = (id: number) =>
    categories.find(category => category.id === id)?.name || 'Chưa có danh mục';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quản lý sản phẩm</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {editingId !== null ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </Text>

        <Text style={styles.label}>Tên sản phẩm</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên sản phẩm"
        />

        <Text style={styles.label}>Giá sản phẩm</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Nhập giá"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tên hình ảnh</Text>
        <TextInput
          style={styles.input}
          value={img}
          onChangeText={setImg}
          placeholder="Ví dụ: hinh1.jpg"
        />

        <Text style={styles.label}>Chọn danh mục</Text>
        <View style={styles.categoryList}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                categoryId === category.id && styles.selectedCategory,
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  categoryId === category.id && styles.selectedText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
          <Text style={styles.buttonText}>
            {editingId !== null ? 'Cập nhật' : 'Thêm sản phẩm'}
          </Text>
        </TouchableOpacity>

        {editingId !== null && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.buttonText}>Hủy chỉnh sửa</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.listTitle}>
        Danh sách sản phẩm ({products.length})
      </Text>

      <FlatList
        data={products}
        scrollEnabled={false}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có sản phẩm nào.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.product}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text>Giá: {formatPrice(item.price)}</Text>
              <Text>Danh mục: {getCategoryName(item.categoryId)}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editProduct(item)}
              >
                <Text style={styles.buttonText}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  form: {
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 10,
  },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 7,
    padding: 10,
  },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    padding: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  selectedCategory: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  categoryText: { color: '#333' },
  selectedText: { color: '#fff' },
  saveButton: {
    backgroundColor: '#E53935',
    padding: 12,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 22, marginBottom: 10 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  actions: { gap: 7, marginLeft: 8 },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 9,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    padding: 9,
    borderRadius: 6,
  },
  empty: { color: '#777', textAlign: 'center', marginVertical: 20 },
});

export default ProductManagement;
