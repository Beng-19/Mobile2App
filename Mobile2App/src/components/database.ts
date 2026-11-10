import { open, type NitroSQLiteConnection } from 'react-native-nitro-sqlite';

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

// Phiên đăng nhập lưu trong bộ nhớ khi ứng dụng đang chạy.
let currentUser: User | null = null;

export const getCurrentUser = (): User | null => currentUser;

export const setCurrentUser = (user: User | null): void => {
  currentUser = user;
};

export const logoutUser = (): void => {
  currentUser = null;
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

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

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
    getDb().execute('INSERT INTO categories (name) VALUES (?);', [name.trim()]);
    return true;
  } catch (error) {
    console.error('addCategory error:', error);
    return false;
  }
};

export const updateCategory = async (category: Category): Promise<boolean> => {
  try {
    getDb().execute('UPDATE categories SET name = ? WHERE id = ?;', [category.name, category.id]);
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
  getDb().execute(
    'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?);',
    [product.name, product.price, product.img || '', product.categoryId],
  );
};

export const updateProduct = async (product: Product): Promise<void> => {
  getDb().execute(
    'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ? WHERE id = ?;',
    [product.name, product.price, product.img || '', product.categoryId, product.id],
  );
};

export const deleteProduct = async (id: number): Promise<void> => {
  getDb().execute('DELETE FROM products WHERE id = ?;', [id]);
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
  if (currentUser?.id === user.id) currentUser = user;
};

export const updateUserRole = async (id: number, role: string): Promise<void> => {
  getDb().execute('UPDATE users SET role = ? WHERE id = ?;', [role, id]);
  if (currentUser?.id === id) currentUser = { ...currentUser, role };
};

export const deleteUser = async (id: number): Promise<void> => {
  const database = getDb();
  database.execute('DELETE FROM cart WHERE userId = ?;', [id]);
  database.execute('DELETE FROM user_profiles WHERE userId = ?;', [id]);
  database.execute('DELETE FROM users WHERE id = ?;', [id]);
  if (currentUser?.id === id) currentUser = null;
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
    if (user) currentUser = user;
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
  const database = getDb();

  const productResult = database.execute(
    'SELECT * FROM products WHERE id = ? LIMIT 1;',
    [productId],
  );

  const products = (productResult.rows?._array as Product[]) || [];
  const product = products[0];

  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  const cartResult = database.execute(
    'SELECT * FROM cart WHERE userId = ? AND productId = ? LIMIT 1;',
    [userId, productId],
  );

  const cartItems = (cartResult.rows?._array as CartItem[]) || [];

  if (cartItems.length > 0) {
    const oldItem = cartItems[0];

    database.execute(
      'UPDATE cart SET quantity = ? WHERE id = ?;',
      [oldItem.quantity + quantity, oldItem.id],
    );
  } else {
    database.execute(
      `INSERT INTO cart
       (userId, productId, name, price, quantity, img)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        userId,
        productId,
        product.name,
        product.price,
        quantity,
        product.img,
      ],
    );
  }
};

export const fetchCart = async (
  userId: number,
): Promise<CartItem[]> => {
  try {
    const result = getDb().execute(
      'SELECT * FROM cart WHERE userId = ? ORDER BY id DESC;',
      [userId],
    );

    return (result.rows?._array as CartItem[]) || [];
  } catch (error) {
    console.error('fetchCart error:', error);
    return [];
  }
};

export const updateCartQuantity = async (
  cartId: number,
  quantity: number,
): Promise<void> => {
  if (quantity <= 0) {
    await removeFromCart(cartId);
    return;
  }

  getDb().execute(
    'UPDATE cart SET quantity = ? WHERE id = ?;',
    [quantity, cartId],
  );
};

export const removeFromCart = async (
  cartId: number,
): Promise<void> => {
  getDb().execute(
    'DELETE FROM cart WHERE id = ?;',
    [cartId],
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
export const checkout = async (userId: number): Promise<boolean> => {
  try {
    const database = getDb();
    const cartResult = database.execute('SELECT * FROM cart WHERE userId = ?;', [userId]);
    const items = (cartResult.rows?._array as CartItem[]) || [];
    if (items.length === 0) return false;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const createdAt = new Date().toISOString();

    const result = database.execute(
      'INSERT INTO orders (userId, total, createdAt, status) VALUES (?, ?, ?, ?);',
      [userId, total, createdAt, 'Đang xử lý'],
    );

    const insertedRows = (result as any).insertedRows;
    let orderId: number | undefined =
      typeof insertedRows?.[0]?.insertId === 'number' ? insertedRows[0].insertId : undefined;

    if (!orderId) {
      const latest = database.execute(
        'SELECT id FROM orders WHERE userId = ? ORDER BY id DESC LIMIT 1;',
        [userId],
      );
      const rows = (latest.rows?._array as { id: number }[]) || [];
      orderId = rows[0]?.id;
    }

    if (!orderId) return false;

    items.forEach((item: CartItem) => {
      database.execute(
        `INSERT INTO order_items (orderId, productId, name, price, quantity, img)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [orderId, item.productId, item.name, item.price, item.quantity, item.img],
      );
    });

    await clearCart(userId);
    return true;
  } catch (error) {
    console.error('checkout error:', error);
    return false;
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
    return [];
  }
};

export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const result = getDb().execute('SELECT * FROM order_items WHERE orderId = ?;', [orderId]);
    return (result.rows?._array as OrderItem[]) || [];
  } catch (error) {
    console.error('fetchOrderItems error:', error);
    return [];
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
    return null;
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  getDb().execute(
    `INSERT OR REPLACE INTO user_profiles (userId, fullName, phone, address)
     VALUES (?, ?, ?, ?);`,
    [profile.userId, profile.fullName, profile.phone, profile.address],
  );
};
