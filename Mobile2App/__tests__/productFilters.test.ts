import { filterProducts } from '../src/components/productFilters';
import type { Category, Product } from '../src/components/database';

const categories: Category[] = [
  { id: 1, name: 'Giày' },
  { id: 2, name: 'Balo' },
  { id: 3, name: 'Túi' },
];

const products: Product[] = [
  { id: 1, name: 'Sneaker basic', price: 99999, img: '', categoryId: 1 },
  { id: 2, name: 'Sneaker mid', price: 100000, img: '', categoryId: 1 },
  { id: 3, name: 'Boot', price: 500000, img: '', categoryId: 1 },
  { id: 4, name: 'Travel case', price: 500001, img: '', categoryId: 2 },
  { id: 5, name: 'Backpack premium', price: 1000000, img: '', categoryId: 2 },
  { id: 6, name: 'Leather bag', price: 1000001, img: '', categoryId: 3 },
];

const matchingIds = (
  search: string,
  filterId:
    | 'all'
    | 'under-100000'
    | '100000-500000'
    | '500000-1000000'
    | 'over-1000000',
) =>
  filterProducts(products, categories, search, filterId).map(
    product => product.id,
  );

describe('preset price and product filters', () => {
  it('applies each preset boundary and restores all products', () => {
    expect(matchingIds('', 'under-100000')).toEqual([1]);
    expect(matchingIds('', '100000-500000')).toEqual([2, 3]);
    expect(matchingIds('', '500000-1000000')).toEqual([3, 4, 5]);
    expect(matchingIds('', 'over-1000000')).toEqual([6]);
    expect(matchingIds('', 'all')).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('combines the selected price range with name and category search', () => {
    expect(matchingIds('sneaker', '100000-500000')).toEqual([2]);
    expect(matchingIds('giay', '100000-500000')).toEqual([2, 3]);
  });
});
