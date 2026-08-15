import { createSlice } from '@reduxjs/toolkit';

// Default to 'dark' mode as requested
const initialMode = typeof window !== 'undefined'
  ? localStorage.getItem('canteen_theme') || 'dark'
  : 'dark';

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialMode);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialMode
  },
  reducers: {
    toggleTheme: (state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('canteen_theme', nextMode);
        document.documentElement.setAttribute('data-theme', nextMode);
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('canteen_theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
