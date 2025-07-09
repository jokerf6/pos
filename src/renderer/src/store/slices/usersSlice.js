import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Get all users
export const getUsers = createAsyncThunk(
  "users/getAll",
  async (data, { rejectWithValue }) => {
    try {
      console.log("Fetching users10...");
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
    } catch (error) {
      console.log("Error fetching users:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  "users/search",
  async (name, { rejectWithValue }) => {
    try {
      console.log("Fetching users...");
      if (window.electronAPI) {
        const result = await window.electronAPI.users.search(name);
        return result;
      } else {
        // Development fallback
        return null;
      }
    } catch (error) {
      console.log("Error fetching users:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  "users/create",
  async (newUser, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.create(newUser);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      const message = error?.message || error?.error || "Unknown error";
      return rejectWithValue(message.split("Error: ")[1] || message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async (updatedUser, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.update(updatedUser);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      const message = error?.message || error?.error || "Unknown error";
      return rejectWithValue(message.split("Error: ")[1] || message);
    }
  }
);

// Delete user
export const UserById = createAsyncThunk(
  "users/getById",
  async (userId, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.getById(userId);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (userId, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.users.delete(userId);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    total: 0,
    loading: false,
    selectedUser: null,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(UserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(UserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(UserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.loading = false;
        state.users = action.payload.users;
        state.total = action.payload.total; // Assuming payload is an array of users
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = usersSlice.actions;
export default usersSlice.reducer;
