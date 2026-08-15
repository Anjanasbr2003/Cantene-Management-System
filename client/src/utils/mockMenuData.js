export const defaultSeedMenuItems = [
  {
    id: 'menu_1',
    name: 'Quantum Espresso',
    description: 'High-altitude roasted dark roast infused with nitrogen micro-bubbles for velocity smoothness.',
    price: 4.5,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    dietaryTags: ['Vegan', 'Gluten-Free', 'Keto'],
    sizes: [
      { name: 'Single Shot (S)', priceOffset: 0 },
      { name: 'Double Shot (M)', priceOffset: 1.2 },
      { name: 'Hyper Velocity (L)', priceOffset: 2.2 }
    ],
    addOns: [
      { name: 'Oat Milk Foam', price: 0.8 },
      { name: 'Vanilla Plasma Syrups', price: 0.5 }
    ],
    nutritionalInfo: { calories: 15, protein: 0.5, carbs: 2, fats: 0 },
    isAvailable: true,
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
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
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
    rating: 4.8,
    reviewCount: 24,
    isHappyHourDiscount: true,
    discountPercent: 15
  },
  {
    id: 'menu_3',
    name: 'Cyber Wagyu Burger',
    description: 'A5 Wagyu patty with black truffle aioli, aged cheddar, caramelised onions on brioche.',
    price: 16.5,
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    dietaryTags: ['Veg'],
    sizes: [
      { name: 'Single Slice', priceOffset: 0 }
    ],
    addOns: [
      { name: 'Extra Gelato Scoop', price: 2.0 }
    ],
    nutritionalInfo: { calories: 410, protein: 6, carbs: 54, fats: 21 },
    isAvailable: true,
    rating: 4.85,
    reviewCount: 31,
    isHappyHourDiscount: false,
    discountPercent: 0
  }
];
