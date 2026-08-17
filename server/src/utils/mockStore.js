// Hybrid In-Memory & Persistence Store for Antigravity Smart Canteen System

const crypto = require('crypto');

// Initial Mock Seed Data
const defaultUsers = [
  {
    id: 'usr_admin',
    name: 'Dr. Orion Vance',
    email: 'admin@orbitcanteen.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 800-555-0199',
    loyaltyPoints: 1250,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_admin_alt',
    name: 'Dr. Orion Vance',
    email: 'admin@antigravity.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 800-555-0199',
    loyaltyPoints: 1250,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_staff',
    name: 'Elena Rostova',
    email: 'staff@orbitcanteen.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 800-555-0142',
    loyaltyPoints: 450,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_staff_alt',
    name: 'Elena Rostova',
    email: 'staff@antigravity.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 800-555-0142',
    loyaltyPoints: 450,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_customer',
    name: 'Alex Mercer',
    email: 'customer@orbitcanteen.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    phone: '+1 800-555-0188',
    loyaltyPoints: 340,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_customer_alt',
    name: 'Alex Mercer',
    email: 'customer@antigravity.io',
    passwordHash: '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', // orbitcanteen2026
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    phone: '+1 800-555-0188',
    loyaltyPoints: 340,
    createdAt: new Date().toISOString()
  }
];

const defaultSuppliers = [
  { id: 'sup_1', name: 'Apex Bio-Organics', contact: 'orders@apexorganics.io', phone: '+1 555-9012', leadTimeDays: 2 },
  { id: 'sup_2', name: 'Starlight Dairy & Produce', contact: 'supply@starlightdairy.com', phone: '+1 555-4421', leadTimeDays: 1 },
  { id: 'sup_3', name: 'CyberGrains & Bakery', contact: 'logistics@cybergrains.io', phone: '+1 555-8833', leadTimeDays: 3 }
];

const defaultInventory = [
  {
    id: 'inv_1',
    sku: 'INV-COFF-01',
    name: 'Quantum Espresso Beans',
    category: 'Beverages Raw',
    unit: 'kg',
    currentStock: 45,
    reorderLevel: 15,
    purchasePrice: 18.5,
    supplierId: 'sup_1',
    batchNumber: 'BT-2026-08A',
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv_2',
    sku: 'INV-MILK-02',
    name: 'Organic Oat Milk',
    category: 'Dairy & Plant',
    unit: 'liters',
    currentStock: 8, // Low Stock Alert Trigger!
    reorderLevel: 12,
    purchasePrice: 3.2,
    supplierId: 'sup_2',
    batchNumber: 'BT-2026-08B',
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString(), // Expiring in 5 days!
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv_3',
    sku: 'INV-MEAT-03',
    name: 'Wagyu Beef Patties',
    category: 'Meat & Proteins',
    unit: 'units',
    currentStock: 65,
    reorderLevel: 20,
    purchasePrice: 7.5,
    supplierId: 'sup_1',
    batchNumber: 'BT-2026-08C',
    expiryDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv_4',
    sku: 'INV-AVOC-04',
    name: 'Hass Avocados',
    category: 'Fresh Produce',
    unit: 'kg',
    currentStock: 14,
    reorderLevel: 10,
    purchasePrice: 4.8,
    supplierId: 'sup_2',
    batchNumber: 'BT-2026-08D',
    expiryDate: new Date(Date.now() + 4 * 86400000).toISOString(), // Expiring in 4 days!
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv_5',
    sku: 'INV-TRUF-05',
    name: 'Black Truffle Oil',
    category: 'Gourmet Condiments',
    unit: 'bottles',
    currentStock: 12,
    reorderLevel: 5,
    purchasePrice: 32.0,
    supplierId: 'sup_3',
    batchNumber: 'BT-2026-07Z',
    expiryDate: new Date(Date.now() + 120 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'inv_6',
    sku: 'INV-CHEES-06',
    name: 'Aged Cheddar Slices',
    category: 'Dairy & Plant',
    unit: 'pack',
    currentStock: 0, // OUT OF STOCK Automation test!
    reorderLevel: 10,
    purchasePrice: 5.5,
    supplierId: 'sup_2',
    batchNumber: 'BT-2026-07X',
    expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  }
];

const defaultMenuItems = [
  {
    id: 'menu_1',
    name: 'Quantum Espresso',
    description: 'High-altitude roasted dark roast infused with nitrogen micro-bubbles for velocity smoothness.',
    price: 4.5,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Keto'],
    sizes: [
      { name: 'Single Shot (S)', priceOffset: 0 },
      { name: 'Double Shot (M)', priceOffset: 1.2 },
      { name: 'Hyper Velocity (L)', priceOffset: 2.2 }
    ],
    addOns: [
      { name: 'Oat Milk Foam', price: 0.8, linkedInventoryId: 'inv_2' },
      { name: 'Vanilla Plasma Syrups', price: 0.5 }
    ],
    nutritionalInfo: { calories: 15, protein: 0.5, carbs: 2, fats: 0 },
    isAvailable: true,
    linkedInventoryIds: ['inv_1'],
    rating: 4.9,
    reviewCount: 38,
    isHappyHourDiscount: false,
    discountPercent: 0
  },
  {
    id: 'menu_2',
    name: 'Nebula Matcha Latte',
    description: 'Ceremonial grade Japanese Uji matcha whisked with warm oat milk and agave nectar.',
    price: 6.0,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
    dietaryTags: ['Veg', 'Vegan', 'Gluten-Free'],
    sizes: [
      { name: 'Standard (M)', priceOffset: 0 },
      { name: 'Grand Nebula (L)', priceOffset: 1.5 }
    ],
    addOns: [
      { name: 'Collagen Boost', price: 1.5 },
      { name: 'Boba Pearls', price: 1.0 }
    ],
    nutritionalInfo: { calories: 140, protein: 4, carbs: 18, fats: 3.5 },
    isAvailable: true,
    linkedInventoryIds: ['inv_2'],
    rating: 4.8,
    reviewCount: 24,
    isHappyHourDiscount: true,
    discountPercent: 15 // Happy Hour discount!
  },
  {
    id: 'menu_3',
    name: 'Cyber Wagyu Burger',
    description: 'A5 Wagyu patty with black truffle aioli, aged cheddar, caramelised onions on brioche.',
    price: 16.5,
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    dietaryTags: ['Non-Veg'],
    sizes: [
      { name: 'Single Stack (M)', priceOffset: 0 },
      { name: 'Double Gravity Stack (L)', priceOffset: 5.5 }
    ],
    addOns: [
      { name: 'Crispy Bacon', price: 2.0 },
      { name: 'Fried Farm Egg', price: 1.5 }
    ],
    nutritionalInfo: { calories: 720, protein: 42, carbs: 48, fats: 38 },
    isAvailable: true,
    linkedInventoryIds: ['inv_3', 'inv_5'],
    rating: 4.95,
    reviewCount: 64,
    isHappyHourDiscount: false,
    discountPercent: 0
  },
  {
    id: 'menu_4',
    name: 'Zero-G Avocado Toast',
    description: 'Sourdough toast topped with smashed Hass avocados, pink radish, micro-greens and poached egg.',
    price: 11.5,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
    dietaryTags: ['Veg', 'Keto'],
    sizes: [
      { name: '1 Slice', priceOffset: -2.5 },
      { name: '2 Slices', priceOffset: 0 }
    ],
    addOns: [
      { name: 'Smoked Salmon', price: 4.0 },
      { name: 'Feta Cheese', price: 1.5 }
    ],
    nutritionalInfo: { calories: 380, protein: 14, carbs: 32, fats: 22 },
    isAvailable: true,
    linkedInventoryIds: ['inv_4'],
    rating: 4.7,
    reviewCount: 19,
    isHappyHourDiscount: false,
    discountPercent: 0
  },
  {
    id: 'menu_5',
    name: 'Supernova Truffle Pasta',
    description: 'Handcrafted tagliatelle tossed in creamy black truffle oil, wild mushrooms, and parmesan.',
    price: 18.0,
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600',
    dietaryTags: ['Veg'],
    sizes: [
      { name: 'Regular', priceOffset: 0 },
      { name: 'Family Size', priceOffset: 8.0 }
    ],
    addOns: [
      { name: 'Grilled Chicken Breast', price: 3.5 }
    ],
    nutritionalInfo: { calories: 640, protein: 18, carbs: 75, fats: 28 },
    isAvailable: true,
    linkedInventoryIds: ['inv_5'],
    rating: 4.9,
    reviewCount: 42,
    isHappyHourDiscount: false,
    discountPercent: 0
  },
  {
    id: 'menu_6',
    name: 'Dark Matter Chocolate Brownie',
    description: 'Warm fudge brownie made with 85% Valrhona cacao, served with vanilla bean gelato.',
    price: 7.5,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    dietaryTags: ['Veg'],
    sizes: [
      { name: 'Single Slice', priceOffset: 0 }
    ],
    addOns: [
      { name: 'Extra Gelato Scoop', price: 2.0 }
    ],
    nutritionalInfo: { calories: 410, protein: 6, carbs: 54, fats: 21 },
    isAvailable: true,
    linkedInventoryIds: [],
    rating: 4.85,
    reviewCount: 31,
    isHappyHourDiscount: false,
    discountPercent: 0
  }
];

const defaultOrders = [
  {
    id: 'ORD-9821',
    customerName: 'Alex Mercer',
    customerId: 'usr_customer',
    orderType: 'Dine-In',
    tableNumber: 'T-04',
    status: 'Preparing',
    items: [
      {
        menuItemId: 'menu_3',
        name: 'Cyber Wagyu Burger',
        selectedSize: 'Single Stack (M)',
        price: 16.5,
        quantity: 1,
        selectedAddOns: [{ name: 'Fried Farm Egg', price: 1.5 }],
        specialInstructions: 'Medium rare patty please'
      },
      {
        menuItemId: 'menu_1',
        name: 'Quantum Espresso',
        selectedSize: 'Double Shot (M)',
        price: 5.7,
        quantity: 1,
        selectedAddOns: [],
        specialInstructions: ''
      }
    ],
    subtotal: 23.7,
    discount: 2.0,
    loyaltyPointsEarned: 23,
    loyaltyPointsRedeemed: 20,
    tax: 1.9,
    totalAmount: 23.6,
    paymentMethod: 'Card Online',
    paymentStatus: 'Paid',
    estimatedPrepMinutes: 12,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    statusHistory: [
      { status: 'Received', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      { status: 'Preparing', timestamp: new Date(Date.now() - 8 * 60000).toISOString() }
    ]
  },
  {
    id: 'ORD-9820',
    customerName: 'Sophia Lin',
    customerId: 'usr_customer_2',
    orderType: 'Takeaway',
    tableNumber: null,
    status: 'Ready',
    items: [
      {
        menuItemId: 'menu_2',
        name: 'Nebula Matcha Latte',
        selectedSize: 'Standard (M)',
        price: 5.1, // with happy hour discount
        quantity: 2,
        selectedAddOns: [{ name: 'Boba Pearls', price: 1.0 }],
        specialInstructions: 'Less ice'
      }
    ],
    subtotal: 12.2,
    discount: 0,
    loyaltyPointsEarned: 12,
    loyaltyPointsRedeemed: 0,
    tax: 0.98,
    totalAmount: 13.18,
    paymentMethod: 'Wallet',
    paymentStatus: 'Paid',
    estimatedPrepMinutes: 8,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    statusHistory: [
      { status: 'Received', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { status: 'Preparing', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
      { status: 'Ready', timestamp: new Date(Date.now() - 5 * 60000).toISOString() }
    ]
  },
  {
    id: 'ORD-9819',
    customerName: 'Marcus Vance',
    customerId: 'usr_customer_3',
    orderType: 'Delivery',
    tableNumber: null,
    deliveryAddress: 'Sector 7, Tech Lab Tower 3, Suite 402',
    status: 'Completed',
    items: [
      {
        menuItemId: 'menu_5',
        name: 'Supernova Truffle Pasta',
        selectedSize: 'Regular',
        price: 18.0,
        quantity: 1,
        selectedAddOns: [],
        specialInstructions: 'Extra parmesan cheese'
      }
    ],
    subtotal: 18.0,
    discount: 0,
    loyaltyPointsEarned: 18,
    loyaltyPointsRedeemed: 0,
    tax: 1.44,
    totalAmount: 19.44,
    paymentMethod: 'Card Online',
    paymentStatus: 'Paid',
    estimatedPrepMinutes: 15,
    createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
    statusHistory: [
      { status: 'Received', timestamp: new Date(Date.now() - 65 * 60000).toISOString() },
      { status: 'Preparing', timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
      { status: 'Ready', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
      { status: 'Completed', timestamp: new Date(Date.now() - 10 * 60000).toISOString() }
    ]
  }
];

const defaultTables = [
  { id: 'tbl_1', tableNumber: 'T-01', capacity: 2, status: 'Vacant', activeOrderId: null, qrCodeUrl: 'T-01' },
  { id: 'tbl_2', tableNumber: 'T-02', capacity: 4, status: 'Occupied', activeOrderId: 'ORD-9822', qrCodeUrl: 'T-02' },
  { id: 'tbl_3', tableNumber: 'T-03', capacity: 2, status: 'Vacant', activeOrderId: null, qrCodeUrl: 'T-03' },
  { id: 'tbl_4', tableNumber: 'T-04', capacity: 4, status: 'Occupied', activeOrderId: 'ORD-9821', qrCodeUrl: 'T-04' },
  { id: 'tbl_5', tableNumber: 'T-05', capacity: 6, status: 'Cleaning', activeOrderId: null, qrCodeUrl: 'T-05' },
  { id: 'tbl_6', tableNumber: 'T-06', capacity: 2, status: 'Vacant', activeOrderId: null, qrCodeUrl: 'T-06' }
];

const defaultStockMovements = [
  {
    id: 'mov_1',
    inventoryId: 'inv_1',
    itemName: 'Quantum Espresso Beans',
    type: 'Stock-In',
    quantity: 20,
    unit: 'kg',
    batchNumber: 'BT-2026-08A',
    responsibleStaff: 'Elena Rostova',
    reason: 'Purchase Order PO-1042 fulfilled',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'mov_2',
    inventoryId: 'inv_2',
    itemName: 'Organic Oat Milk',
    type: 'Wastage',
    quantity: 2,
    unit: 'liters',
    batchNumber: 'BT-2026-07Y',
    responsibleStaff: 'Elena Rostova',
    reason: 'Spilled during espresso prep',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const defaultReviews = [
  {
    id: 'rev_1',
    menuItemId: 'menu_3',
    menuItemName: 'Cyber Wagyu Burger',
    customerName: 'Alex Mercer',
    rating: 5,
    comment: 'Mindblowing juicy Wagyu patty with black truffle! Worth every credit!',
    status: 'Approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rev_2',
    menuItemId: 'menu_1',
    menuItemName: 'Quantum Espresso',
    customerName: 'Elena V.',
    rating: 5,
    comment: 'Super velvety nitro texture. Best caffeine boost in Sector 4!',
    status: 'Approved',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const defaultAuditLogs = [
  {
    id: 'audit_1',
    action: 'INVENTORY_STOCK_UPDATE',
    performedBy: 'Elena Rostova (Staff)',
    details: 'Logged Stock-In of 20kg Quantum Espresso Beans',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'audit_2',
    action: 'MENU_HAPPY_HOUR_TOGGLE',
    performedBy: 'Dr. Orion Vance (Admin)',
    details: 'Activated 15% Happy Hour discount on Nebula Matcha Latte',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

class MockStore {
  constructor() {
    this.users = [...defaultUsers];
    this.suppliers = [...defaultSuppliers];
    this.inventory = [...defaultInventory];
    this.menuItems = [...defaultMenuItems];
    this.orders = [...defaultOrders];
    this.tables = [...defaultTables];
    this.stockMovements = [...defaultStockMovements];
    this.reviews = [...defaultReviews];
    this.auditLogs = [...defaultAuditLogs];
  }

  // Stock Movement & Automation Helper
  logMovement(movement) {
    const newMovement = {
      id: 'mov_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...movement
    };
    this.stockMovements.unshift(newMovement);

    // Update current inventory stock
    const item = this.inventory.find(i => i.id === movement.inventoryId);
    if (item) {
      if (movement.type === 'Stock-In' || movement.type === 'Return') {
        item.currentStock += Number(movement.quantity);
      } else {
        item.currentStock = Math.max(0, item.currentStock - Number(movement.quantity));
      }
      item.lastUpdated = new Date().toISOString();

      // Automation: If stock hits 0, update linked menu items to unavailable!
      if (item.currentStock === 0) {
        this.menuItems.forEach(m => {
          if (m.linkedInventoryIds && m.linkedInventoryIds.includes(item.id)) {
            m.isAvailable = false;
          }
        });
      }
    }
    return newMovement;
  }

  addAuditLog(action, performedBy, details) {
    this.auditLogs.unshift({
      id: 'audit_' + Date.now(),
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

const mockStore = new MockStore();
module.exports = mockStore;
