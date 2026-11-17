import { open } from 'react-native-nitro-sqlite';
import {
  checkout,
  fetchOrderItems,
  initDatabase,
} from '../src/components/database';

jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn(),
}));

describe('order image persistence', () => {
  it('migrates image columns and snapshots the product image at checkout', async () => {
    const savedImage = 'content://media/products/5';
    const execute = jest.fn((query: string, _params?: unknown[]) => {
      if (query.startsWith('PRAGMA table_info(')) {
        return { rows: { _array: [] } };
      }
      if (query.includes('SELECT id FROM users')) {
        return { rows: { _array: [{ id: 7 }] } };
      }
      if (query.includes('SELECT cart.productId')) {
        return {
          rows: {
            _array: [{
              productId: 5,
              name: 'Túi xách nữ',
              price: 980000,
              quantity: 1,
              img: savedImage,
            }],
          },
        };
      }
      if (query.includes('last_insert_rowid()')) {
        return { rows: { _array: [{ id: 42 }] } };
      }
      if (query.includes('FROM order_items WHERE orderId')) {
        return {
          rows: {
            _array: [{
              id: 1,
              orderId: 42,
              productId: 5,
              name: 'Túi xách nữ',
              price: 980000,
              quantity: 1,
              img: savedImage,
            }],
          },
        };
      }
      return { rows: { _array: [] } };
    });
    const connection = {
      execute,
      transaction: async (work: (tx: { execute: typeof execute }) => Promise<unknown>) =>
        work({ execute }),
    };
    (open as jest.Mock).mockReturnValue(connection);

    await initDatabase();
    expect(
      execute.mock.calls.some(([query]) =>
        String(query).includes('ALTER TABLE order_items ADD COLUMN img'),
      ),
    ).toBe(true);
    expect(
      execute.mock.calls.some(([query]) =>
        String(query).includes('ALTER TABLE products ADD COLUMN img'),
      ),
    ).toBe(true);

    await checkout(7, {
      recipientName: 'Test',
      recipientPhone: '0900000000',
      recipientAddress: 'Test address',
      paymentMethod: 'COD',
    });

    const insertOrderItem = execute.mock.calls.find(([query]) =>
      String(query).includes('INSERT INTO order_items'),
    );
    expect(insertOrderItem?.[1]).toEqual([
      42,
      5,
      'Túi xách nữ',
      980000,
      1,
      savedImage,
    ]);

    const savedItems = await fetchOrderItems(42);
    expect(savedItems[0].img).toBe(savedImage);
    expect(
      execute.mock.calls.some(([query]) =>
        String(query).includes('SELECT id, orderId, productId, name, price, quantity, img'),
      ),
    ).toBe(true);
  });
});
