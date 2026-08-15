import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async (token, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/inventory', {
      headers: { Authorization: `Bearer ${token || ''}` }
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
});

export const fetchExpiryRadar = createAsyncThunk('inventory/fetchExpiryRadar', async (token) => {
  try {
    const res = await fetch('/api/inventory/expiry-radar', {
      headers: { Authorization: `Bearer ${token || ''}` }
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
});

export const fetchValuation = createAsyncThunk('inventory/fetchValuation', async (token) => {
  try {
    const res = await fetch('/api/inventory/valuation', {
      headers: { Authorization: `Bearer ${token || ''}` }
    });
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
});

const defaultSeedInventory = [
  { id: 'inv_1', sku: 'INV-COFF-01', name: 'Quantum Espresso Beans', category: 'Beverages Raw', unit: 'kg', currentStock: 45, reorderLevel: 15, purchasePrice: 18.5 },
  { id: 'inv_2', sku: 'INV-MILK-02', name: 'Oat Milk Barista Blend', category: 'Dairy & Plant', unit: 'liters', currentStock: 8, reorderLevel: 12, purchasePrice: 3.2 },
  { id: 'inv_3', sku: 'INV-MEAT-03', name: 'Wagyu Beef Patties', category: 'Meat & Proteins', unit: 'units', currentStock: 65, reorderLevel: 20, purchasePrice: 7.5 },
  { id: 'inv_4', sku: 'INV-AVOC-04', name: 'Hass Avocados', category: 'Fresh Produce', unit: 'kg', currentStock: 14, reorderLevel: 10, purchasePrice: 4.8 },
  { id: 'inv_5', sku: 'INV-TRUF-05', name: 'Black Truffle Oil', category: 'Gourmet Condiments', unit: 'bottles', currentStock: 12, reorderLevel: 5, purchasePrice: 32.0 },
  { id: 'inv_6', sku: 'INV-CHEES-06', name: 'Aged Cheddar Slices', category: 'Dairy & Plant', unit: 'pack', currentStock: 25, reorderLevel: 10, purchasePrice: 5.5 }
];

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: defaultSeedInventory,
    expiryRadar: null,
    valuation: null,
    loading: false,
    error: null
  },
  reducers: {
    updateStockLocally: (state, action) => {
      const { id, inventoryId, delta, newStock } = action.payload;
      const targetId = id || inventoryId;
      const item = state.items.find(i => i.id === targetId);

      if (item) {
        if (delta !== undefined) {
          const current = Number(item.currentStock || 0);
          const change = Number(delta);
          item.currentStock = Math.max(0, current + change);
        } else if (newStock !== undefined) {
          item.currentStock = Math.max(0, Number(newStock));
        }
        item.lastUpdated = new Date().toISOString();
      }
    },
    addInventoryItemLocally: (state, action) => {
      const newItem = action.payload;
      const existingIndex = state.items.findIndex(i => i.id === newItem.id || i.sku === newItem.sku);
      if (existingIndex >= 0) {
        state.items[existingIndex] = { ...state.items[existingIndex], ...newItem };
      } else {
        state.items.unshift(newItem);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchExpiryRadar.fulfilled, (state, action) => {
        state.expiryRadar = action.payload;
      })
      .addCase(fetchValuation.fulfilled, (state, action) => {
        state.valuation = action.payload;
      });
  }
});

export const { updateStockLocally, addInventoryItemLocally } = inventorySlice.actions;
export default inventorySlice.reducer;
