import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMenuItems = createAsyncThunk('menu/fetchMenuItems', async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/menu?${query}`);
  const data = await res.json();
  return data.data || [];
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
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
        state.loading = true;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCategory, setDietary, setSearchQuery, toggleLocalAvailability, toggleLocalHappyHour } = menuSlice.actions;
export default menuSlice.reducer;
