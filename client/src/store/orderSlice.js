import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (token) => {
  const res = await fetch('/api/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data || [];
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    activeTrackingOrderId: null,
    loading: false,
    error: null
  },
  reducers: {
    setActiveTrackingOrder: (state, action) => {
      state.activeTrackingOrderId = action.payload;
    },
    upsertOrder: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(o => o.id === updatedOrder.id);
      if (index > -1) {
        state.orders[index] = updatedOrder;
      } else {
        state.orders.unshift(updatedOrder);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setActiveTrackingOrder, upsertOrder } = orderSlice.actions;
export default orderSlice.reducer;
