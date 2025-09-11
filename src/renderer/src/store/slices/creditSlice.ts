import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface CreditItem {
  id?: number;
  reason?: string;
  amount?: number;
  created_at?: string;
  [key: string]: any;
}

interface CreditState {
  credits: CreditItem[];
  dailyCredits: CreditItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const getCredit = createAsyncThunk<
  { data: any; total: number },
  any,
  { rejectValue: string }
>("credit/getAll", async (data:any, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.credit.getAll(data);
      console.log("getCredit result", result);
      return result;
    } else {
      return { data: [], total: 0 };
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createCredit = createAsyncThunk<any, any, { rejectValue: string }>(
  "credit/create",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.credit.create(data);
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

export const CreditByDaily = createAsyncThunk<
  { data: any; total: number },
  any,
  { rejectValue: string }
>("credit/getByDaily", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.credit.getByDaily(data);
      console.log("fuck data->", result)
      return result;
    } else {
      return { data: [], total: 0 };
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteCredit = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("credit/delete", async (id, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.credit.delete(id);
      return result;
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: CreditState = {
  credits: [],
  dailyCredits: [],
  total: 0,
  loading: false,
  error: null,
};

const creditSlice = createSlice({
  name: "credit",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get credit cases
      .addCase(getCredit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCredit.fulfilled, (state, action) => {
        state.loading = false;
        state.credits = action.payload.data;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(getCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get credits";
      })
      // Create credit cases
      .addCase(createCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCredit.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create credit";
      })
      // Daily credit cases
      .addCase(CreditByDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreditByDaily.fulfilled, (state, action) => {
        console.log("CreditByDaily fulfilled", action.payload);
        state.loading = false;
        state.dailyCredits = action.payload.data;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(CreditByDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get daily credits";
      })
      // Delete credit cases
      .addCase(deleteCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCredit.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete credit";
      });
  },
});

export const { clearError } = creditSlice.actions;
export default creditSlice.reducer;
