import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";
import { clearBranches, switchBranch } from "./branchesSlice";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
    permissions: string[]; // ✅ أضف الصلاحيات هنا

}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Async thunk for login
export const loginUser = createAsyncThunk<
  any,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue,dispatch } ) => {
 if (!window.electronAPI) {
    return rejectWithValue("Electron API غير متاح");
  }

  try {
    const result = await window.electronAPI.auth.login(credentials);
    if (!result || !result.success) {
      return rejectWithValue("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
    console.log("Login successful->", result);
     if (result.user.branchId) {
    await  dispatch(switchBranch(result.user.branchId));
    }
    return result;
  } catch (error: any) {
    console.error("Electron login error:", error);
    return rejectWithValue(
      error?.message || "حدث خطأ أثناء تسجيل الدخول"
    );
  }
});


export const logoutUser = createAsyncThunk<
  { success: boolean },
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue, dispatch }) => {
  try {
    if (window.electronAPI) {
      dispatch(clearBranches());  

      const result = await window.electronAPI.auth.logout();
      return result;
    } else {
      return { success: true };
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});


// Async thunk for checking authentication status
export const checkAuth = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.auth.checkAuth();
      return result;
    } else {
      // Fallback for development - assume not authenticated
      return {
        success: false,
        user: {
          id: 0,
          username: "",
          email: "",
          role: "",
          permissions: [] as string[],
        },
      };
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Authentication check failed");
  }
});

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Login pending");
      })
      .addCase(loginUser.fulfilled, (state, action) => {

        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
 

        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || "Login failed";

      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.split("Error:")[1] || "Logout failed";
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null; // Don't show error for failed auth check
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;

