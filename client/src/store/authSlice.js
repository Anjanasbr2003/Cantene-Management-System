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

const initialUser = savedUser
  ? JSON.parse(savedUser)
  : {
      id: 'usr_customer',
      name: 'Alex Mercer',
      email: 'customer@antigravity.io',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      loyaltyPoints: 340,
      phone: '+1 800-555-0188'
    };

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || 'demo_token_customer',
    user: initialUser,
    loading: false,
    error: null
  },
  reducers: {
    setDemoRole: (state, action) => {
      const role = action.payload;
      if (role === 'admin') {
        state.user = {
          id: 'usr_admin',
          name: 'Dr. Orion Vance',
          email: 'admin@antigravity.io',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          loyaltyPoints: 1250,
          phone: '+1 800-555-0199'
        };
        state.token = 'demo_token_admin';
      } else if (role === 'staff') {
        state.user = {
          id: 'usr_staff',
          name: 'Elena Rostova',
          email: 'staff@antigravity.io',
          role: 'staff',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          loyaltyPoints: 450,
          phone: '+1 800-555-0142'
        };
        state.token = 'demo_token_staff';
      } else {
        state.user = {
          id: 'usr_customer',
          name: 'Alex Mercer',
          email: 'customer@antigravity.io',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          loyaltyPoints: 340,
          phone: '+1 800-555-0188'
        };
        state.token = 'demo_token_customer';
      }
      localStorage.setItem('orbit_token', state.token);
      localStorage.setItem('orbit_user', JSON.stringify(state.user));
    },
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

export const { setDemoRole, logout, clearAuthError, updateLoyaltyPoints } = authSlice.actions;
export default authSlice.reducer;
