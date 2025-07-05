import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.auth.login(credentials);
        return result;
      } else {
        // Fallback for development without Electron
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          return {
            success: true,
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@casher.local',
              role: 'admin'
            }
          };
        } else {
          throw new Error('Invalid username or password');
        }
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.auth.logout();
        return result;
      } else {
        // Fallback for development
        return { success: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for checking auth status
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.auth.checkAuth();
        return result;
      } else {
        // Fallback for development
        const savedUser = localStorage.getItem('casher_user');
        if (savedUser) {
          return {
            success: true,
            authenticated: true,
            user: JSON.parse(savedUser)
          };
        } else {
          return {
            success: false,
            authenticated: false
          };
        }
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage in development
      if (!window.electronAPI) {
        localStorage.removeItem('casher_user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          // Save to localStorage in development
          if (!window.electronAPI) {
            localStorage.setItem('casher_user', JSON.stringify(action.payload.user));
          }
        } else {
          state.error = action.payload.message || 'Login failed';
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        // Clear localStorage in development
        if (!window.electronAPI) {
          localStorage.removeItem('casher_user');
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.authenticated) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Auth check failed';
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;

