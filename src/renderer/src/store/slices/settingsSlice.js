import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Get all users
export const getAll = createAsyncThunk(
  "settings/getAll",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.settings.getAll();
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getByDomain = createAsyncThunk(
  "settings/getByDomain",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.settings.getByDomain(data);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getByKey = createAsyncThunk(
  "settings/getByKey",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.settings.getByKey(data);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user
export const updateSettings = createAsyncThunk(
  "settings/update",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.settings.update(data);
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

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: [],
    loading: false,
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

      .addCase(getByDomain.pending, (state) => {
        state.loading = true;
      })
      .addCase(getByDomain.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data;
      })
      .addCase(getByDomain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getByKey.pending, (state) => {
        state.loading = true;
      })
      .addCase(getByKey.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getByKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
