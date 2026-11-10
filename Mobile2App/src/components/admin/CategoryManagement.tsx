import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from '../database';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    setCategories(await fetchCategories());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const saveCategory = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (editingId !== null) {
      await updateCategory({ id: editingId, name: name.trim() });
    } else {
      const success = await addCategory(name.trim());
      if (!success) {
        Alert.alert('Lỗi', 'Không thể thêm danh mục');
        return;
      }
    }

    setName('');
    setEditingId(null);
    loadData();
  };

  const removeCategory = async (id: number) => {
    const success = await deleteCategory(id);

    if (!success) {
      Alert.alert(
        'Không thể xóa',
        'Danh mục đang có sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước.',
      );
      return;
    }

    loadData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý danh mục</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên danh mục"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={saveCategory}>
        <Text style={styles.buttonText}>
          {editingId !== null ? 'Cập nhật danh mục' : 'Thêm danh mục'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item.id);
                  setName(item.name);
                }}
              >
                <Text style={styles.edit}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeCategory(item.id)}>
                <Text style={styles.delete}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#E53935',
    padding: 13,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  item: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 18 },
  edit: { color: '#1976D2', fontWeight: 'bold' },
  delete: { color: '#E53935', fontWeight: 'bold' },
});

export default CategoryManagement;