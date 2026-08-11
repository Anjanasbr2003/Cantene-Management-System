import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    orderType: 'Dine-In', // 'Dine-In', 'Takeaway', 'Delivery'
    tableNumber: 'T-04',
    deliveryAddress: 'Sector 7, Tech Lab Tower 3',
    promoCode: '',
    loyaltyPointsToRedeem: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      // Check if identical item (same menu id, size, add-ons) already exists
      const existingIdx = state.items.findIndex(item => 
        item.menuItemId === newItem.menuItemId &&
        item.selectedSize === newItem.selectedSize &&
        JSON.stringify(item.selectedAddOns || []) === JSON.stringify(newItem.selectedAddOns || [])
      );

      if (existingIdx > -1) {
        state.items[existingIdx].quantity += newItem.quantity || 1;
      } else {
        state.items.push({
          cartId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          ...newItem,
          quantity: newItem.quantity || 1
        });
      }
    },
    updateQuantity: (state, action) => {
      const { cartId, delta } = action.payload;
      const item = state.items.find(i => i.cartId === cartId);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.cartId !== cartId);
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.cartId !== action.payload);
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload;
    },
    setTableNumber: (state, action) => {
      state.tableNumber = action.payload;
    },
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
    },
    setPromoCode: (state, action) => {
      state.promoCode = action.payload;
    },
    setLoyaltyPointsToRedeem: (state, action) => {
      state.loyaltyPointsToRedeem = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = '';
      state.loyaltyPointsToRedeem = 0;
    }
  }
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  setOrderType,
  setTableNumber,
  setDeliveryAddress,
  setPromoCode,
  setLoyaltyPointsToRedeem,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
