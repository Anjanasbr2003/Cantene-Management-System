import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { defaultSeedMenuItems } from '../utils/mockMenuData';

export const fetchMenuItems = createAsyncThunk('menu/fetchMenuItems', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/menu?${query}`);
    if (!res.ok) throw new Error('Failed to fetch menu items');
    const data = await res.json();
    return (data.data && data.data.length > 0) ? data.data : defaultSeedMenuItems;
  } catch (err) {
    // Return fallback seed menu items if server is offline/starting
    return defaultSeedMenuItems;
  }
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: defaultSeedMenuItems,
    selectedCategory: 'All',
    selectedDietary: 'All',
    searchQuery: '',
    loading: false,
    error: null
  },
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setDietary: (state, action) => {
      state.selectedDietary = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleLocalAvailability: (state, action) => {
      const id = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.isAvailable = !item.isAvailable;
      }
    },
    toggleLocalHappyHour: (state, action) => {
      const { id, isHappyHourDiscount, discountPercent } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.isHappyHourDiscount = isHappyHourDiscount;
        if (discountPercent !== undefined) item.discountPercent = discountPercent;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = false; // Keep smooth UX without flash
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchMenuItems.rejected, (state) => {
        state.loading = false;
        // Keep defaultSeedMenuItems
      });
  }
});

export const { setCategory, setDietary, setSearchQuery, toggleLocalAvailability, toggleLocalHappyHour } = menuSlice.actions;
export default menuSlice.reducer;
