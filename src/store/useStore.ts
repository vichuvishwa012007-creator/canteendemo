import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'admin';

export interface Institution {
  id: string;
  name: string;
  code: string;
  logo: string;
  color: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  upiId: string;
  merchantName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  institutionId: string;
  avatar?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  institutionId: string;
  available: boolean;
  stock: number;
  popular: boolean;
  prepTime: string;
  veg: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'pending_payment' | 'ordered' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  institutionId: string;
  items: OrderItem[];
  amount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  paymentMethod?: string;
  upiTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  notes?: string;
  locked: boolean;
}

export interface Review {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  reviewText: string;
  createdAt: string;
}

// ─── Store Interface ───────────────────────────────────────────────────────────

interface SmartCanteenStore {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Institution
  selectedInstitution: Institution | null;
  institutions: Institution[];

  // Menu
  menuItems: MenuItem[];

  // Cart
  cart: CartItem[];

  // Orders
  orders: Order[];
  activeOrder: Order | null;

  // Reviews
  reviews: Review[];

  // UI
  currentPage: string;
  adminPage: string;
  sidebarOpen: boolean;
  cartOpen: boolean;

  // Actions - Auth
  login: (user: User) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;

  // Actions - Institution
  setSelectedInstitution: (institution: Institution) => void;

  // Actions - Menu
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Actions - Cart
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Actions - Orders
  placeOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setActiveOrder: (order: Order | null) => void;

  // Actions - Reviews
  addReview: (review: Review) => void;

  // Actions - UI
  setPage: (page: string) => void;
  setAdminPage: (page: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;

  // Computed
  getCartTotal: () => number;
  getCartCount: () => number;
  getInstitutionOrders: (institutionId: string) => Order[];
  getInstitutionMenu: (institutionId: string) => MenuItem[];
  getInstitutionReviews: (institutionId: string) => Review[];
  getInstitutionRating: (institutionId: string) => { average: number; count: number };
}

// ─── Initial Data ──────────────────────────────────────────────────────────────

export const INSTITUTIONS: Institution[] = [
  {
    id: 'inst_001',
    name: 'S.A.College Of Arts & Science',
    code: 'S.A',
    logo: '/images/SACAS-logo-e1630927124121.png',
    color: '#7c3aed',
    address: 'Thiruverkadu,Chennai-600077',
    contactEmail: 'canteen@sacas.edu.in',
    contactPhone: '+91 98765 43210',
    upiId: 'sacascanteen@paytm',
    merchantName: 'Sacas Canteen'
  },
  {
    id: 'inst_002',
    name: 'S.A Engineering College',
    code: 'SAEC',
    logo: '/images/SAEC-150x150.avif',
    color: '#2563eb',
    address: 'Thiruverkadu,Chennai-600077',
    contactEmail: 'canteen@saengineering.edu.in',
    contactPhone: '+91 98765 43211',
    upiId: 'saeccanteen@paytm',
    merchantName: 'saec Canteen'
  }
];

const generateMenuItems = (institutionId: string): MenuItem[] => [
  // Beverages
  { id: `${institutionId}_m1`, name: 'Masala Tea', price: 15, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', description: 'Fresh brewed masala chai with aromatic spices', institutionId, available: true, stock: 50, popular: true, prepTime: '3 min', veg: true },
  { id: `${institutionId}_m2`, name: 'Filter Coffee', price: 20, category: 'Beverages', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', description: 'Strong South Indian filter coffee', institutionId, available: true, stock: 40, popular: true, prepTime: '4 min', veg: true },
  { id: `${institutionId}_m3`, name: 'Fresh Lime Juice', price: 30, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', description: 'Fresh squeezed lime with mint', institutionId, available: true, stock: 25, popular: false, prepTime: '2 min', veg: true },
  { id: `${institutionId}_m4`, name: 'Mango Lassi', price: 45, category: 'Beverages', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80', description: 'Thick creamy mango yogurt drink', institutionId, available: true, stock: 20, popular: true, prepTime: '3 min', veg: true },
  { id: `${institutionId}_m5`, name: 'Cold Coffee', price: 40, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', description: 'Chilled coffee with ice cream', institutionId, available: true, stock: 15, popular: true, prepTime: '5 min', veg: true },

  // Snacks
  { id: `${institutionId}_m6`, name: 'Veg Samosa', price: 12, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', description: 'Crispy fried pastry with spiced potato filling', institutionId, available: true, stock: 60, popular: true, prepTime: '2 min', veg: true },
  { id: `${institutionId}_m7`, name: 'Veg Puff', price: 25, category: 'Snacks', image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80', description: 'Flaky pastry with vegetable stuffing', institutionId, available: true, stock: 45, popular: true, prepTime: '3 min', veg: true },
  { id: `${institutionId}_m8`, name: 'Bread Omelette', price: 35, category: 'Snacks', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80', description: 'Toasted bread with fluffy egg omelette', institutionId, available: true, stock: 30, popular: false, prepTime: '7 min', veg: false },
  { id: `${institutionId}_m9`, name: 'Aloo Bonda', price: 18, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', description: 'Crispy fried potato dumplings', institutionId, available: true, stock: 35, popular: false, prepTime: '3 min', veg: true },
  { id: `${institutionId}_m10`, name: 'Paneer Tikka', price: 80, category: 'Snacks', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', description: 'Grilled cottage cheese with spices', institutionId, available: true, stock: 20, popular: true, prepTime: '10 min', veg: true },

  // Meals
  { id: `${institutionId}_m11`, name: 'Veg Meals', price: 70, category: 'Meals', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', description: 'Rice, sambar, rasam, 2 veggies, papad & pickle', institutionId, available: true, stock: 100, popular: true, prepTime: '5 min', veg: true },
  { id: `${institutionId}_m12`, name: 'Chicken Meals', price: 100, category: 'Meals', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', description: 'Rice, chicken curry, sambar, papad & pickle', institutionId, available: true, stock: 80, popular: true, prepTime: '7 min', veg: false },
  { id: `${institutionId}_m13`, name: 'Curd Rice', price: 40, category: 'Meals', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', description: 'Tempered curd rice with pomegranate', institutionId, available: true, stock: 50, popular: false, prepTime: '3 min', veg: true },
  { id: `${institutionId}_m14`, name: 'Biryani', price: 120, category: 'Meals', image: 'https://images.unsplash.com/photo-1563379091339-03246963d651?w=400&q=80', description: 'Aromatic basmati rice with choice of protein', institutionId, available: true, stock: 40, popular: true, prepTime: '10 min', veg: false },

  // Fast Food
  { id: `${institutionId}_m15`, name: 'Veg Burger', price: 55, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80', description: 'Crispy patty with fresh veggies in sesame bun', institutionId, available: true, stock: 25, popular: true, prepTime: '8 min', veg: true },
  { id: `${institutionId}_m16`, name: 'French Fries', price: 50, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', description: 'Golden crispy fries with dipping sauce', institutionId, available: true, stock: 40, popular: true, prepTime: '6 min', veg: true },
  { id: `${institutionId}_m17`, name: 'Chicken Wrap', price: 75, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', description: 'Grilled chicken in whole wheat wrap', institutionId, available: true, stock: 20, popular: false, prepTime: '8 min', veg: false },
  { id: `${institutionId}_m18`, name: 'Cheese Pizza Slice', price: 60, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80', description: 'Fresh baked cheese pizza slice', institutionId, available: true, stock: 30, popular: true, prepTime: '5 min', veg: true },

  // Desserts
  { id: `${institutionId}_m19`, name: 'Gulab Jamun', price: 25, category: 'Desserts', image: 'https://images.unsplash.com/photo-1601303516535-3816b0ca8b56?w=400&q=80', description: 'Soft milk dumplings in rose sugar syrup', institutionId, available: true, stock: 40, popular: true, prepTime: '2 min', veg: true },
  { id: `${institutionId}_m20`, name: 'Ice Cream', price: 40, category: 'Desserts', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80', description: 'Creamy vanilla ice cream with toppings', institutionId, available: true, stock: 25, popular: false, prepTime: '2 min', veg: true },
];

// Generate sample orders
const generateSampleOrders = (): Order[] => {
  const orders: Order[] = [];
  const statuses: DeliveryStatus[] = ['ordered', 'preparing', 'ready', 'delivered', 'cancelled'];
  const institutions = ['inst_001', 'inst_002'];

  for (let i = 1; i <= 25; i++) {
    const instId = institutions[i % institutions.length];
    const isPaid = i % 7 !== 0;
    const deliveryStatus = statuses[i % statuses.length];
    const amount = [49, 70, 95, 120, 55, 140, 35, 80, 100, 65][i % 10];

    orders.push({
      id: `order_${i.toString().padStart(4, '0')}`,
      orderId: `ORD${(300 + i).toString()}`,
      userId: `user_${i % 5 + 1}`,
      userName: ['Arjun Kumar', 'Priya Sharma', 'Rahul Verma', 'Sneha Patel', 'Karthik Raj'][i % 5],
      userPhone: ['+91 98765 43210', '+91 87654 32109', '+91 76543 21098', '+91 65432 10987', '+91 54321 09876'][i % 5],
      userEmail: ['arjun@student.sacas.edu', 'priya@student.saeng.edu', 'rahul@student.sacas.edu', 'sneha@student.sacas.edu', 'karthik@student.sacas.edu'][i % 5],
      institutionId: instId,
      items: [
        { id: `${instId}_m${(i % 10) + 1}`, name: ['Samosa', 'Masala Tea', 'Veg Meals', 'Coffee', 'Puff'][i % 5], price: [12, 15, 70, 20, 25][i % 5], quantity: (i % 3) + 1 },
        ...(i % 2 === 0 ? [{ id: `${instId}_m${(i % 5) + 6}`, name: ['Mango Lassi', 'Gulab Jamun', 'Biryani', 'Veg Burger', 'Ice Cream'][i % 5], price: [45, 25, 120, 55, 40][i % 5], quantity: 1 }] : [])
      ],
      amount,
      paymentStatus: isPaid ? 'paid' : 'pending',
      deliveryStatus: isPaid ? deliveryStatus : 'pending_payment',
      createdAt: new Date(Date.now() - (i * 15 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 10 * 60 * 1000)).toISOString(),
      deliveredAt: deliveryStatus === 'delivered' ? new Date(Date.now() - (i * 5 * 60 * 1000)).toISOString() : undefined,
      locked: deliveryStatus === 'delivered' || deliveryStatus === 'cancelled',
      paymentMethod: isPaid ? 'UPI' : undefined,
      upiTransactionId: isPaid ? `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined,
    });
  }
  return orders;
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<SmartCanteenStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      authLoading: false,
      selectedInstitution: null,
      institutions: INSTITUTIONS,
      menuItems: INSTITUTIONS.flatMap(inst => generateMenuItems(inst.id)),
      cart: [],
      orders: generateSampleOrders(),
      activeOrder: null,
      reviews: [],
      currentPage: 'home',
      adminPage: 'dashboard',
      sidebarOpen: false,
      cartOpen: false,

      // Auth actions
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false, cart: [], activeOrder: null, currentPage: 'home', selectedInstitution: null }),
      setAuthLoading: (loading) => set({ authLoading: loading }),

      // Institution actions
      setSelectedInstitution: (institution) => set({ selectedInstitution: institution }),

      // Menu actions
      setMenuItems: (items) => set({ menuItems: items }),
      addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
      updateMenuItem: (id, updates) => set((state) => ({
        menuItems: state.menuItems.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      deleteMenuItem: (id) => set((state) => ({
        menuItems: state.menuItems.filter(item => item.id !== id)
      })),

      // Cart actions
      addToCart: (menuItem) => set((state) => {
        const existing = state.cart.find(c => c.menuItem.id === menuItem.id);
        if (existing) {
          return { cart: state.cart.map(c => c.menuItem.id === menuItem.id ? { ...c, quantity: c.quantity + 1 } : c) };
        }
        return { cart: [...state.cart, { menuItem, quantity: 1 }] };
      }),
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(c => c.menuItem.id !== itemId)
      })),
      updateCartQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) return { cart: state.cart.filter(c => c.menuItem.id !== itemId) };
        return { cart: state.cart.map(c => c.menuItem.id === itemId ? { ...c, quantity } : c) };
      }),
      clearCart: () => set({ cart: [] }),

      // Order actions
      placeOrder: (order) => set((state) => ({ orders: [order, ...state.orders], activeOrder: order })),
      updateOrder: (orderId, updates) => set((state) => {
        const updatedOrders = state.orders.map(o => o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o);
        const updatedActive = state.activeOrder?.id === orderId ? { ...state.activeOrder, ...updates, updatedAt: new Date().toISOString() } : state.activeOrder;
        return { orders: updatedOrders, activeOrder: updatedActive };
      }),
      setActiveOrder: (order) => set({ activeOrder: order }),

      // Review actions
      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),

      // UI actions
      setPage: (page) => set({ currentPage: page }),
      setAdminPage: (page) => set({ adminPage: page }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCartOpen: (open) => set({ cartOpen: open }),

      // Computed
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      getInstitutionOrders: (institutionId) => get().orders.filter(o => o.institutionId === institutionId),
      getInstitutionMenu: (institutionId) => get().menuItems.filter(m => m.institutionId === institutionId),
      getInstitutionReviews: (institutionId) => get().reviews
        .filter(r => r.institutionId === institutionId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getInstitutionRating: (institutionId) => {
        const instReviews = get().reviews.filter(r => r.institutionId === institutionId);
        if (instReviews.length === 0) return { average: 0, count: 0 };
        const sum = instReviews.reduce((acc, r) => acc + r.rating, 0);
        return { average: Math.round((sum / instReviews.length) * 10) / 10, count: instReviews.length };
      },
    }),
    {
      name: 'smartcanteen-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        selectedInstitution: state.selectedInstitution,
        orders: state.orders,
        menuItems: state.menuItems,
        reviews: state.reviews,
      }),
    }
  )
);    