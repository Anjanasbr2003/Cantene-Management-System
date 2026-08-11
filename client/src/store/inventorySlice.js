import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async (token) => {
  const res = await fetch('/api/inventory', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data || [];
});

export const fetchExpiryRadar = createAsyncThunk('inventory/fetchExpiryRadar', async (token) => {
  const res = await fetch('/api/inventory/expiry-radar', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data;
});

export const fetchValuation = createAsyncThunk('inventory/fetchValuation', async (token) => {
  const res = await fetch('/api/inventory/valuation', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    expiryRadar: null,
    valuation: null,
    loading: false,
    error: null
  },
  reducers: {
    updateStockLocally: (state, action) => {
      const { inventoryId, newStock } = action.payload;
      const item = state.items.find(i => i.id === inventoryId);
      if (item) {
        item.currentStock = newStock;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchExpiryRadar.fulfilled, (state, action) => {
        state.expiryRadar = action.payload;
      })
      .addCase(fetchValuation.fulfilled, (state, action) => {
        state.valuation = action.payload;
      });
  }
});

export const { updateStockLocally } = inventorySlice.actions;
export default inventorySlice.reducer;
