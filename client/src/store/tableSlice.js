import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTables = createAsyncThunk('tables/fetchTables', async () => {
  const res = await fetch('/api/tables');
  const data = await res.json();
  return data.data || [];
});

const tableSlice = createSlice({
  name: 'tables',
  initialState: {
    tables: [],
    loading: false
  },
  reducers: {
    updateTableStatusLocally: (state, action) => {
      const { id, status } = action.payload;
      const table = state.tables.find(t => t.id === id || t.tableNumber === id);
      if (table) {
        table.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
      });
  }
});

export const { updateTableStatusLocally } = tableSlice.actions;
export default tableSlice.reducer;
