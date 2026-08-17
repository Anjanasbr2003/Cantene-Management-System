import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Persistent session loader
const savedToken = localStorage.getItem('orbit_token');
const savedUser = localStorage.getItem('orbit_user');

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, roleDemo }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, roleDemo })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || 'Authentication failed');
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error occurred');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error occurred');
    }
  }
);

const initialUser = savedUser ? JSON.parse(savedUser) : null;


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || null,
    user: initialUser,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem('orbit_token');
      localStorage.removeItem('orbit_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateLoyaltyPoints: (state, action) => {
      if (state.user) {
        state.user.loyaltyPoints = action.payload;
        localStorage.setItem('orbit_user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        localStorage.setItem('orbit_token', action.payload.token);
        localStorage.setItem('orbit_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Invalid email or password';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        localStorage.setItem('orbit_token', action.payload.token);
        localStorage.setItem('orbit_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });
  }
});

export const { logout, clearAuthError, updateLoyaltyPoints } = authSlice.actions;
export default authSlice.reducer;
