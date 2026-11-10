
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  initDatabase,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from './database';

const CategoryManagement = ({ onBack }: { onBack?: () => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    initDatabase(() => {
      loadCategories();
    });
  }, []);

  // Lấy danh sách loại sản phẩm
  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  // Thêm hoặc cập nhật loại sản phẩm
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên loại sản phẩm!');
      return;
    }

    let success = false;

    if (editingId !== null) {
      success = await updateCategory({
        id: editingId,
        name: name.trim(),
      });
    } else {
      success = await addCategory(name.trim());
    }

    if (success) {
      Alert.alert('Thông báo', 'Lưu thành công!');
      setName('');
      setEditingId(null);
      loadCategories();
    } else {
      Alert.alert('Thông báo', 'Không thể lưu dữ liệu!');
    }
  };

  // Chọn loại sản phẩm để sửa
  const handleEdit = (item: Category) => {
    setName(item.name);
    setEditingId(item.id);
  };

  // Hủy sửa
  const handleCancel = () => {
    setName('');
    setEditingId(null);
  };

  // Xóa loại sản phẩm
  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa loại sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCategory(id);

            if (success) {
              Alert.alert('Thông báo', 'Xóa thành công!');
              loadCategories();
            } else {
              Alert.alert(
                'Không thể xóa',
                'Loại sản phẩm này đang có sản phẩm sử dụng!'
              );
            }
          },
        },
      ]
    );
  };

  // Hiển thị từng loại sản phẩm
  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryId}>ID: {item.id}</Text>
      </View>

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
  );

  return (
    <View style={styles.container}>
         {onBack && (
    <TouchableOpacity onPress={onBack}>
      <Text style={{ color: '#2563eb', fontSize: 16, marginBottom: 10 }}>
        ‹ Quay lại
      </Text>
    </TouchableOpacity>
  )}

      <Text style={styles.title}>QUẢN LÝ LOẠI SẢN PHẨM</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên loại sản phẩm"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>
          {editingId !== null ? 'Cập nhật loại sản phẩm' : 'Thêm loại sản phẩm'}
        </Text>
      </TouchableOpacity>

      {editingId !== null && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Hủy sửa</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.subtitle}>
        Danh sách loại sản phẩm ({categories.length})
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có loại sản phẩm nào!</Text>
        }
      />
    </View>
  );
};

export default CategoryManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#2878D0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#222',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  categoryId: {
    color: '#777',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#E69A25',
    padding: 9,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    padding: 9,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
