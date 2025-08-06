import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  granted_at?: string;
  granted_by?: number;
}

interface User {
  id: number;
  username: string;
  password?: string;
  active: boolean;
  created_at?: string;
  last_login?: string;
  permissions_updated_at?: string;
  permissions_count?: number;
  permissions?: Permission[];
}

interface UserPayload {
  username: string;
  password: string;
  permissions?: number[];
  createdBy?: number;
}

interface UpdateUserPayload {
  id: number;
  username: string;
  password?: string;
  permissions?: number[];
  updatedBy?: number;
}

interface UsersState {
  users: User[];
  total: number;
  loading: boolean;
  selectedUser: User | null;
  error: string | null;
}

// Async thunks
export const getUsers = createAsyncThunk(
  "users/getAll",
  async (data: any, { rejectWithValue }) => {
    try {
      console.log("Fetching users...");
      if (window.electronAPI) {
        console.log("Using Electron API to fetch users");
        const result = await window.electronAPI.users.getAll(data);
        console.log(result);
        console.log("Users fetched:", result);
        return result;
      } else {
        // Development fallback
        const local = localStorage.getItem("casher_users") || "[]";
        return JSON.parse(local);
      }
    } catch (error: any) {
      console.log("Error fetching users:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  "users/search",
  async (data, { rejectWithValue }) => {
    try {
      console.log("Searching users...");
      if (window.electronAPI) {
        const result = await window.electronAPI.users.search(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      console.log("Error searching users:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (newUser: UserPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.create(newUser);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      const message = error?.message || error?.error || "Unknown error";
      return rejectWithValue(message.split("Error: ")[1] || message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async (userData: UpdateUserPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.update(userData);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      const message = error?.message || error?.error || "Unknown error";
      return rejectWithValue(message.split("Error: ")[1] || message);
    }
  }
);

export const UserById = createAsyncThunk(
  "users/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.getById(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.delete(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: UsersState = {
  users: [],
  total: 0,
  loading: false,
  selectedUser: null,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(UserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(UserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload?.user || null;
      })
      .addCase(UserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
