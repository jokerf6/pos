import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getDaily = createAsyncThunk(
  "daily/get",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.daily.get();
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const openDaily = createAsyncThunk(
  "daily/open",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.daily.open();

        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closeDaily = createAsyncThunk(
  "daily/close",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.daily.close();

        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dailySlice = createSlice({
  name: "daily",
  initialState: {
    daily: [],
    total: 0,
    loading: false,
    selectedDaily: null,
    error: null,
  },
  reducers: {
    clearDailyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDaily.fulfilled, (state, action) => {
        state.loading = false;
        state.daily = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(getDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(openDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(openDaily.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(openDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(closeDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(closeDaily.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(closeDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDailyError } = dailySlice.actions;
export default dailySlice.reducer;
