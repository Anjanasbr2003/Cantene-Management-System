import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import menuReducer from './menuSlice';
import inventoryReducer from './inventorySlice';
import orderReducer from './orderSlice';
import tableReducer from './tableSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    menu: menuReducer,
    inventory: inventoryReducer,
    orders: orderReducer,
    tables: tableReducer
  }
});
