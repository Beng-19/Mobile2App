import type { Category, Product } from './database';

export type PriceFilterId =
  | 'all'
  | 'under-100000'
  | '100000-500000'
  | '500000-1000000'
  | 'over-1000000';

type PriceFilterOption = {
  id: PriceFilterId;
  label: string;
  min: number | null;
  max: number | null;
  minExclusive?: boolean;
  maxExclusive?: boolean;
};

export const PRICE_FILTER_OPTIONS: PriceFilterOption[] = [
  { id: 'all', label: 'Tất cả', min: null, max: null },
  {
    id: 'under-100000',
    label: 'Dưới 100.000đ',
    min: null,
    max: 100000,
    maxExclusive: true,
  },
  {
    id: '100000-500000',
    label: '100.000đ – 500.000đ',
    min: 100000,
    max: 500000,
  },
  {
    id: '500000-1000000',
    label: '500.000đ – 1.000.000đ',
    min: 500000,
    max: 1000000,
  },
  {
    id: 'over-1000000',
    label: 'Trên 1.000.000đ',
    min: 1000000,
    max: null,
    minExclusive: true,
  },
];

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

export const filterProducts = (
  products: Product[],
  categories: Category[],
  search: string,
  priceFilterId: PriceFilterId,
): Product[] => {
  const keyword = normalizeText(search);
  const categoryNames = new Map(
    categories.map(
      category => [category.id, normalizeText(category.name)] as const,
    ),
  );
  const priceFilter =
    PRICE_FILTER_OPTIONS.find(option => option.id === priceFilterId) ??
    PRICE_FILTER_OPTIONS[0];

  return products.filter(product => {
    const productName = normalizeText(product.name);
    const categoryName = categoryNames.get(product.categoryId) ?? '';
    const matchesSearch =
      !keyword ||
      productName.includes(keyword) ||
      categoryName.includes(keyword);
    const matchesMinimum =
      priceFilter.min === null ||
      (priceFilter.minExclusive
        ? product.price > priceFilter.min
        : product.price >= priceFilter.min);
    const matchesMaximum =
      priceFilter.max === null ||
      (priceFilter.maxExclusive
        ? product.price < priceFilter.max
        : product.price <= priceFilter.max);

    return matchesSearch && matchesMinimum && matchesMaximum;
  });
};
