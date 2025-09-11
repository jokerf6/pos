import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface SettingsState {
  settings: any[];
  loading: boolean;
  error: string | null;
}

// Get all settings
export const getAll = createAsyncThunk<any[], void, { rejectValue: string }>(
  "settings/getAll",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.settings.get();
        return result;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getByDomain = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("settings/getByDomain", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.settings.getByDomain(data);
      console.log("getByDomain result:", result);
      return result;
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const getByKey = createAsyncThunk<
  { data: { value: string } },
  string,
  { rejectValue: string }
>("settings/getByKey", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.settings.getByKey(data);
      return result;
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateSetting = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>("settings/update", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.settings.update(data);
      return result;
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: SettingsState = {
  settings: [],
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all cases
      .addCase(getAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAll.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get settings";
      })

       .addCase(getByDomain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getByDomain.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(getByDomain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get settings";
      })

      // Update cases
      .addCase(updateSetting.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSetting.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update setting";
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
