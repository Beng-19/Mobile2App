import { open, type NitroSQLiteConnection } from 'react-native-nitro-sqlite';
import {
  getCurrentUser as getAuthCurrentUser,
  setCurrentUser as setAuthCurrentUser,
  logoutUser as logoutAuthUser,
  type User,
} from './auth';

// ======================================================
// KẾT NỐI DATABASE
// ======================================================
let db: NitroSQLiteConnection | null = null;

const getDb = (): NitroSQLiteConnection => {
  if (!db) {
    db = open({ name: 'myDatabase.db' });
  }
  return db;
};

export const getCurrentUser = (): User | null => getAuthCurrentUser();

export const setCurrentUser = (user: User | null): void => {
  setAuthCurrentUser(user);
};

export const logoutUser = (): void => {
  logoutAuthUser();
};

// ======================================================
// KIỂU DỮ LIỆU
// ======================================================
export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type { User };

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  img: string;
};


export type Order = {
  id: number;
  userId: number;
  total: number;
  createdAt: string;
  status: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  paymentMethod?: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  img: string;
};

export type UserProfile = {
  userId: number;
  fullName: string;
  phone: string;
  address: string;
};

export type CheckoutDetails = {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: 'COD';
};

// ======================================================
// DỮ LIỆU MẪU
// ======================================================
const initialCategories: Category[] = [
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Giày' },
  { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' },
  { id: 5, name: 'Túi' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Áo sơ mi', price: 250000, img: 'ao.png', categoryId: 1 },
  { id: 2, name: 'Giày sneaker', price: 1100000, img: 'giay.png', categoryId: 2 },
  { id: 3, name: 'Balo thời trang', price: 490000, img: 'balo.png', categoryId: 3 },
  { id: 4, name: 'Mũ lưỡi trai', price: 120000, img: 'mu-luoi-trai.png', categoryId: 4 },
  { id: 5, name: 'Túi xách nữ', price: 980000, img: 'tui-xach.png', categoryId: 5 },
];

// ======================================================
// KHỞI TẠO DATABASE
// ======================================================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = getDb();

    database.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);

    database.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        img TEXT DEFAULT '',
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);

     database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      );
    `);

    database.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        userId INTEGER PRIMARY KEY,
        fullName TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    database.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        img TEXT DEFAULT '',
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );
    `);
    const ensureColumn = (
      table: string,
      column: string,
      definition: string,
    ) => {
      const columns = database.execute(`PRAGMA table_info(${table});`)
        .rows?._array as { name: string }[] | undefined;
      if (!columns?.some(existing => existing.name === column)) {
        database.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
      }
    };

    ensureColumn('cart', 'userId', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn('cart', 'productId', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn('cart', 'name', "TEXT NOT NULL DEFAULT ''");
    ensureColumn('cart', 'price', 'REAL NOT NULL DEFAULT 0');
    ensureColumn('cart', 'quantity', 'INTEGER NOT NULL DEFAULT 1');
    ensureColumn('cart', 'img', "TEXT DEFAULT ''");
    ensureColumn('products', 'img', "TEXT DEFAULT ''");

    database.execute(`
      UPDATE cart
      SET
        name = (SELECT name FROM products WHERE products.id = cart.productId),
        price = (SELECT price FROM products WHERE products.id = cart.productId),
        img = (SELECT img FROM products WHERE products.id = cart.productId)
      WHERE EXISTS (
        SELECT 1 FROM products WHERE products.id = cart.productId
      );
    `);

    database.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Đang xử lý',
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
    ensureColumn('orders', 'recipientName', "TEXT NOT NULL DEFAULT ''");
    ensureColumn('orders', 'recipientPhone', "TEXT NOT NULL DEFAULT ''");
    ensureColumn('orders', 'recipientAddress', "TEXT NOT NULL DEFAULT ''");
    ensureColumn('orders', 'paymentMethod', "TEXT NOT NULL DEFAULT 'COD'");

    database.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        img TEXT DEFAULT '',
        FOREIGN KEY (orderId) REFERENCES orders(id)
      );
    `);
    ensureColumn('order_items', 'img', "TEXT DEFAULT ''");

    
    initialCategories.forEach(category => {
      database.execute(
        'INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?);',
        [category.id, category.name],
      );
    });

    initialProducts.forEach(product => {
      database.execute(
        'INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?);',
        [product.id, product.name, product.price, product.img, product.categoryId],
      );
    });

    // Cập nhật ảnh mẫu cũ nếu database đã từng lưu hinh1.jpg.
    const imageNames = ['ao.png', 'giay.png', 'balo.png', 'mu-luoi-trai.png', 'tui-xach.png'];
    imageNames.forEach((img, index) => {
      database.execute(
        'UPDATE products SET img = ? WHERE id = ? AND (img = ? OR img IS NULL OR img = ?);',
        [img, index + 1, 'hinh1.jpg', ''],
      );
    });

    // Tạo tài khoản quản trị mặc định nếu chưa có.
    database.execute(
      `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?);`,
      ['admin', '123456', 'admin'],
    );

    console.log('Database initialized successfully');
    onSuccess?.();
  } catch (error) {
    console.error('initDatabase error:', error);
    throw error;
  }
};

// ======================================================
// DANH MỤC
// ======================================================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const result = getDb().execute('SELECT * FROM categories ORDER BY id;');
    return (result.rows?._array as Category[]) || [];
  } catch (error) {
    console.error('fetchCategories error:', error);
    return [];
  }
};

export const addCategory = async (name: string): Promise<boolean> => {
  try {
    const value = name.trim();
    if (!value) return false;
    const existing = getDb().execute(
      'SELECT id FROM categories WHERE name = ? COLLATE NOCASE LIMIT 1;',
      [value],
    );
    if ((existing.rows?._array as { id: number }[] | undefined)?.length) {
      return false;
    }
    getDb().execute('INSERT INTO categories (name) VALUES (?);', [value]);
    return true;
  } catch (error) {
    console.error('addCategory error:', error);
    return false;
  }
};

export const updateCategory = async (category: Category): Promise<boolean> => {
  try {
    const value = category.name.trim();
    if (!value) return false;
    const existing = getDb().execute(
      'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id != ? LIMIT 1;',
      [value, category.id],
    );
    if ((existing.rows?._array as { id: number }[] | undefined)?.length) {
      return false;
    }
    getDb().execute('UPDATE categories SET name = ? WHERE id = ?;', [value, category.id]);
    return true;
  } catch (error) {
    console.error('updateCategory error:', error);
    return false;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const database = getDb();
    const result = database.execute(
      'SELECT COUNT(*) AS total FROM products WHERE categoryId = ?;',
      [id],
    );
    const rows = (result.rows?._array as { total: number }[]) || [];
    if ((rows[0]?.total ?? 0) > 0) return false;
    database.execute('DELETE FROM categories WHERE id = ?;', [id]);
    return true;
  } catch (error) {
    console.error('deleteCategory error:', error);
    return false;
  }
};

// ======================================================
// SẢN PHẨM
// ======================================================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const result = getDb().execute('SELECT * FROM products ORDER BY id DESC;');
    return (result.rows?._array as Product[]) || [];
  } catch (error) {
    console.error('fetchProducts error:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  const database = getDb();
  const category = database.execute(
    'SELECT id FROM categories WHERE id = ? LIMIT 1;',
    [product.categoryId],
  );
  if (!(category.rows?._array as { id: number }[] | undefined)?.length) {
    throw new Error('Danh mục sản phẩm không hợp lệ.');
  }
  if (!product.name.trim() || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error('Thông tin sản phẩm không hợp lệ.');
  }
  database.execute(
    'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?);',
    [product.name.trim(), product.price, product.img || '', product.categoryId],
  );
};

export const updateProduct = async (product: Product): Promise<void> => {
  const database = getDb();
  const category = database.execute(
    'SELECT id FROM categories WHERE id = ? LIMIT 1;',
    [product.categoryId],
  );
  if (!(category.rows?._array as { id: number }[] | undefined)?.length) {
    throw new Error('Danh mục sản phẩm không hợp lệ.');
  }
  if (!product.name.trim() || !Number.isFinite(product.price) || product.price <= 0) {
    throw new Error('Thông tin sản phẩm không hợp lệ.');
  }
  database.execute(
    'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ? WHERE id = ?;',
    [product.name.trim(), product.price, product.img || '', product.categoryId, product.id],
  );
};

export const deleteProduct = async (id: number): Promise<void> => {
  const database = getDb();
  await database.transaction(async tx => {
    tx.execute('DELETE FROM cart WHERE productId = ?;', [id]);
    tx.execute('DELETE FROM products WHERE id = ?;', [id]);
  });
};

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const result = getDb().execute(
      'SELECT * FROM products WHERE categoryId = ? ORDER BY id DESC;',
      [categoryId],
    );
    return (result.rows?._array as Product[]) || [];
  } catch (error) {
    console.error('fetchProductsByCategory error:', error);
    return [];
  }
};

export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  try {
    const result = getDb().execute(
      `SELECT products.* FROM products
       LEFT JOIN categories ON products.categoryId = categories.id
       WHERE products.name LIKE ? OR categories.name LIKE ? ORDER BY products.id DESC;`,
      [`%${keyword}%`, `%${keyword}%`],
    );
    return (result.rows?._array as Product[]) || [];
  } catch (error) {
    console.error('searchProductsByNameOrCategory error:', error);
    return [];
  }
};

// ======================================================
// NGƯỜI DÙNG / ĐĂNG NHẬP
// ======================================================
export const addUser = async (
  username: string,
  password: string,
  role: string = 'user',
): Promise<boolean> => {
  try {
    getDb().execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?);',
      [username.trim(), password, role],
    );
    return true;
  } catch (error) {
    console.error('addUser error:', error);
    return false;
  }
};

export const updateUser = async (user: User): Promise<void> => {
  getDb().execute(
    'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?;',
    [user.username, user.password, user.role, user.id],
  );
  const authUser = getCurrentUser();
  if (authUser?.id === user.id) setCurrentUser(user);
};

export const updateUserRole = async (id: number, role: string): Promise<void> => {
  if (!Number.isInteger(id) || id <= 0 || !['admin', 'user'].includes(role)) {
    throw new Error('Thông tin vai trò người dùng không hợp lệ.');
  }
  getDb().execute('UPDATE users SET role = ? WHERE id = ?;', [role, id]);
  const authUser = getCurrentUser();
  if (authUser?.id === id) setCurrentUser({ ...authUser, role });
};

export const deleteUser = async (id: number): Promise<void> => {
  if (getCurrentUser()?.id === id) {
    throw new Error('Không thể xóa tài khoản đang đăng nhập.');
  }
  const database = getDb();
  await database.transaction(async tx => {
    const orders = tx.execute(
      'SELECT id FROM orders WHERE userId = ?;',
      [id],
    ).rows?._array as { id: number }[] | undefined;
    for (const order of orders || []) {
      tx.execute('DELETE FROM order_items WHERE orderId = ?;', [order.id]);
    }
    tx.execute('DELETE FROM orders WHERE userId = ?;', [id]);
    tx.execute('DELETE FROM cart WHERE userId = ?;', [id]);
    tx.execute('DELETE FROM user_profiles WHERE userId = ?;', [id]);
    tx.execute('DELETE FROM users WHERE id = ?;', [id]);
  });
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const result = getDb().execute('SELECT * FROM users ORDER BY id;');
    return (result.rows?._array as User[]) || [];
  } catch (error) {
    console.error('fetchUsers error:', error);
    return [];
  }
};

export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    const result = getDb().execute(
      'SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1;',
      [username.trim(), password],
    );
    const users = (result.rows?._array as User[]) || [];
    const user = users.length > 0 ? users[0] : null;
    if (user) setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('getUserByCredentials error:', error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const result = getDb().execute('SELECT * FROM users WHERE id = ? LIMIT 1;', [id]);
    const users = (result.rows?._array as User[]) || [];
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('getUserById error:', error);
    return null;
  }
};

// ======================================================
// GIỎ HÀNG
// ======================================================

// ======================================================
// GIỎ HÀNG
// ======================================================

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number = 1,
): Promise<void> => {
  try {
    const database = getDb();

    if (!Number.isInteger(userId) || userId <= 0 ||
        !Number.isInteger(productId) || productId <= 0 ||
        !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Thông tin người dùng hoặc sản phẩm không hợp lệ');
    }

    await database.transaction(async tx => {
      const users = tx.execute(
        'SELECT id FROM users WHERE id = ? LIMIT 1;',
        [userId],
      ).rows?._array as { id: number }[] | undefined;
      if (!users?.length) throw new Error('Tài khoản không còn tồn tại. Vui lòng đăng nhập lại.');

      const products = tx.execute(
        'SELECT id, name, price, img FROM products WHERE id = ? LIMIT 1;',
        [productId],
      ).rows?._array as Product[] | undefined;
      const product = products?.[0];
      if (!product) throw new Error('Không tìm thấy sản phẩm trong database.');

      const cartItems = tx.execute(
        'SELECT id FROM cart WHERE userId = ? AND productId = ? ORDER BY id LIMIT 1;',
        [userId, productId],
      ).rows?._array as { id: number }[] | undefined;

      if (cartItems?.length) {
        tx.execute(
          'UPDATE cart SET quantity = quantity + ?, name = ?, price = ?, img = ? WHERE id = ?;',
          [quantity, product.name, product.price, product.img || '', cartItems[0].id],
        );
      } else {
        tx.execute(
          `INSERT INTO cart (userId, productId, name, price, quantity, img)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [userId, productId, product.name, product.price, quantity, product.img || ''],
        );
      }
    });
  } catch (error) {
    console.error('LỖI ADD TO CART:', error);
    throw error;
  }
};

export const fetchCart = async (
  userId: number,
): Promise<CartItem[]> => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Mã người dùng không hợp lệ.');
    }
    const result = getDb().execute(
      `SELECT cart.id, cart.userId, cart.productId, products.name,
              products.price, cart.quantity, products.img
       FROM cart
       INNER JOIN products ON products.id = cart.productId
       WHERE cart.userId = ? ORDER BY cart.id DESC;`,
      [userId],
    );

    return (result.rows?._array as CartItem[]) || [];
  } catch (error) {
    console.error('fetchCart error:', error);
    throw error;
  }
};

export const updateCartQuantity = async (
  userId: number,
  cartId: number,
  quantity: number,
): Promise<void> => {
  if (quantity <= 0) {
    await removeFromCart(userId, cartId);
    return;
  }

  getDb().execute(
    'UPDATE cart SET quantity = ? WHERE id = ? AND userId = ?;',
    [quantity, cartId, userId],
  );
};

export const removeFromCart = async (
  userId: number,
  cartId: number,
): Promise<void> => {
  getDb().execute(
    'DELETE FROM cart WHERE id = ? AND userId = ?;',
    [cartId, userId],
  );
};

export const clearCart = async (
  userId: number,
): Promise<void> => {
  getDb().execute(
    'DELETE FROM cart WHERE userId = ?;',
    [userId],
  );
};
 
// ======================================================
// ĐƠN HÀNG / THANH TOÁN
// ======================================================
export const checkout = async (
  userId: number,
  details: CheckoutDetails,
): Promise<boolean> => {
  try {
    const database = getDb();
    if (!Number.isInteger(userId) || userId <= 0 ||
        !details.recipientName.trim() || !details.recipientPhone.trim() ||
        !details.recipientAddress.trim() || details.paymentMethod !== 'COD') {
      throw new Error('Thông tin giao hàng không hợp lệ.');
    }

    await database.transaction(async tx => {
      const users = tx.execute(
        'SELECT id FROM users WHERE id = ? LIMIT 1;',
        [userId],
      ).rows?._array as { id: number }[] | undefined;
      if (!users?.length) throw new Error('Tài khoản không còn tồn tại.');

      const items = tx.execute(
        `SELECT cart.productId, products.name, products.price, cart.quantity, products.img
         FROM cart
         INNER JOIN products ON products.id = cart.productId
         WHERE cart.userId = ? ORDER BY cart.id;`,
        [userId],
      ).rows?._array as Omit<CartItem, 'id' | 'userId'>[] | undefined;
      if (!items?.length) throw new Error('Giỏ hàng đang trống.');

      const total = items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );
      tx.execute(
        `INSERT INTO orders
         (userId, total, createdAt, status, recipientName, recipientPhone, recipientAddress, paymentMethod)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          userId,
          total,
          new Date().toISOString(),
          'Đang xử lý',
          details.recipientName.trim(),
          details.recipientPhone.trim(),
          details.recipientAddress.trim(),
          details.paymentMethod,
        ],
      );

      const orderRows = tx.execute(
        'SELECT last_insert_rowid() AS id;',
      ).rows?._array as { id: number }[] | undefined;
      const orderId = orderRows?.[0]?.id;
      if (!orderId) throw new Error('Không lấy được mã đơn hàng vừa tạo.');

      for (const item of items) {
        tx.execute(
          `INSERT INTO order_items (orderId, productId, name, price, quantity, img)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [orderId, item.productId, item.name, item.price, item.quantity, item.img || ''],
        );
      }

      tx.execute('DELETE FROM cart WHERE userId = ?;', [userId]);
    });
    return true;
  } catch (error) {
    console.error('checkout error:', error);
    throw error;
  }
};

export const fetchOrders = async (userId: number): Promise<Order[]> => {
  try {
    const result = getDb().execute(
      'SELECT * FROM orders WHERE userId = ? ORDER BY id DESC;',
      [userId],
    );
    return (result.rows?._array as Order[]) || [];
  } catch (error) {
    console.error('fetchOrders error:', error);
    throw error;
  }
};

export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const result = getDb().execute(
      `SELECT id, orderId, productId, name, price, quantity, img
       FROM order_items WHERE orderId = ?;`,
      [orderId],
    );
    return (result.rows?._array as OrderItem[]) || [];
  } catch (error) {
    console.error('fetchOrderItems error:', error);
    throw error;
  }
};


// ======================================================
// QUẢN LÝ ĐƠN HÀNG ADMIN
// ======================================================

export type AdminOrder = Order & {
  username: string;
  fullName: string;
  phone: string;
  address: string;
};

// Lấy tất cả đơn hàng kèm thông tin người dùng
export const fetchAllOrders = async (): Promise<AdminOrder[]> => {
  try {
    const result = getDb().execute(`
      SELECT
        orders.*,
        users.username AS username,
        user_profiles.fullName AS fullName,
        user_profiles.phone AS phone,
        user_profiles.address AS address
      FROM orders
      LEFT JOIN users ON orders.userId = users.id
      LEFT JOIN user_profiles ON orders.userId = user_profiles.userId
      ORDER BY orders.id DESC;
    `);

    return (result.rows?._array as AdminOrder[]) || [];
  } catch (error) {
    console.error('fetchAllOrders error:', error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<void> => {
  try {
    getDb().execute(
      'UPDATE orders SET status = ? WHERE id = ?;',
      [status, orderId],
    );
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    throw error;
  }
};


// ======================================================
// HỒ SƠ NGƯỜI DÙNG
// ======================================================
export const fetchUserProfile = async (userId: number): Promise<UserProfile | null> => {
  try {
    const result = getDb().execute(
      'SELECT * FROM user_profiles WHERE userId = ? LIMIT 1;',
      [userId],
    );
    const profiles = (result.rows?._array as UserProfile[]) || [];
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('fetchUserProfile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  getDb().execute(
    `INSERT OR REPLACE INTO user_profiles (userId, fullName, phone, address)
     VALUES (?, ?, ?, ?);`,
    [profile.userId, profile.fullName, profile.phone, profile.address],
  );
};
