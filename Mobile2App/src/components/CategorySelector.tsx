import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Category } from './database';

type Props = {
  categories: Category[];
  selectedId: number;
  onSelect: (categoryId: number) => void;
};

const CategorySelector = ({ categories, selectedId, onSelect }: Props) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.item, selected && styles.selected]}
            onPress={() => onSelect(category.id)}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CategorySelector;

const styles = StyleSheet.create({
  item: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 8,
  },
  selected: { backgroundColor: '#E53935' },
  text: { color: '#333', fontWeight: '600' },
  selectedText: { color: '#fff' },
});
