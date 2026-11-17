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
    <ScrollView
      style={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.8}
            style={[styles.item, selected && styles.selected]}
            onPress={() => onSelect(category.id)}
          >
            <Text
              numberOfLines={1}
              style={[styles.text, selected && styles.selectedText]}
            >
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
  scroll: {
    height: 56,
    flexGrow: 0,
    flexShrink: 0,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  item: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    marginRight: 8,
  },
  selected: { backgroundColor: '#E53935' },
  text: { color: '#555', fontWeight: '600', fontSize: 14, flexShrink: 0 },
  selectedText: { color: '#fff' },
});
