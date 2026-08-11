import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Persistent demo session
const savedToken = localStorage.getItem('orbit_token');
const savedUser  = localStorage.getItem('orbit_user');

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password, roleDemo }) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, roleDemo })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Authentication failed');
  return data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || null,
    user: savedUser ? JSON.parse(savedUser) : {
      id: 'usr_customer',
      name: 'Alex Mercer',
      email: 'customer@orbitcanteen.io',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      loyaltyPoints: 340,
      phone: '+1 800-555-0188'
    },
    loading: false,
    error: null
  },
  reducers: {
    setDemoRole: (state, action) => {
      const role = action.payload;
      if (role === 'admin') {
        state.user = {
          id: 'usr_admin', name: 'Dr. Orion Vance',
          email: 'admin@orbitcanteen.io', role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          loyaltyPoints: 1250, phone: '+1 800-555-0199'
        };
      } else if (role === 'staff') {
        state.user = {
          id: 'usr_staff', name: 'Elena Rostova',
          email: 'staff@orbitcanteen.io', role: 'staff',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          loyaltyPoints: 450, phone: '+1 800-555-0142'
        };
      } else {
        state.user = {
          id: 'usr_customer', name: 'Alex Mercer',
          email: 'customer@orbitcanteen.io', role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          loyaltyPoints: 340, phone: '+1 800-555-0188'
        };
      }
      localStorage.setItem('orbit_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('orbit_token');
      localStorage.removeItem('orbit_user');
    },
    updateLoyaltyPoints: (state, action) => {
      if (state.user) {
        state.user.loyaltyPoints = action.payload;
        localStorage.setItem('orbit_user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (state)          => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action)  => {
        state.loading = false;
        state.token   = action.payload.token;
        state.user    = action.payload.user;
        localStorage.setItem('orbit_token', action.payload.token);
        localStorage.setItem('orbit_user',  JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected,  (state, action)  => { state.loading = false; state.error = action.error.message; });
  }
});

export const { setDemoRole, logout, updateLoyaltyPoints } = authSlice.actions;
export default authSlice.reducer;
