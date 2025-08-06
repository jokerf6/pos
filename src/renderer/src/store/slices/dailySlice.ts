import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface DailyRecord {
  id: number;
  cashInDrawer: number;
  total_sales: number;
  total_expenses: number;
  total_returns: number;
  opened_at: string;
  closed_at?: string;
  [key: string]: any;
}

interface DailyState {
  daily: DailyRecord[];
  data: any;
  loading: boolean;
  error: string | null;
}

export const getDaily = createAsyncThunk<
  DailyRecord[],
  void,
  { rejectValue: string }
>("daily/get", async (_, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.daily.get();
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const openDaily = createAsyncThunk<any, number, { rejectValue: string }>(
  "daily/open",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.daily.open(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const closeDaily = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("daily/close", async (data, { rejectWithValue }) => {
  console.log("closeDaily called with data:", data);
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.daily.close(data);
      return result;
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: DailyState = {
  daily: [],
  data: null,
  loading: false,
  error: null,
};

const dailySlice = createSlice({
  name: "daily",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get daily cases
      .addCase(getDaily.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDaily.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.daily = action.payload;
        state.error = null;
      })
      .addCase(getDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get daily data";
      })
      // Open daily cases
      .addCase(openDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(openDaily.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(openDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to open daily";
      })
      // Close daily cases
      .addCase(closeDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(closeDaily.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(closeDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to close daily";
      });
  },
});

export const { clearError } = dailySlice.actions;
export default dailySlice.reducer;
