import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getCredit = createAsyncThunk(
  "credit/getAll",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.credit.getAll();
        console.log("getCredit result", result);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCredit = createAsyncThunk(
  "credit/create",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.credit.create(data);
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

export const CreditByDaily = createAsyncThunk(
  "credit/getByDaily",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.credit.getByDaily();
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCredit = createAsyncThunk(
  "credit/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.credit.delete(id);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const creditSlice = createSlice({
  name: "credit",
  initialState: {
    credits: [],
    dailyCredits: [],
    total: 0,
    loading: false,
    selectedCredit: null,
    error: null,
  },
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCredit.fulfilled, (state, action) => {
        console.log("action4", action.payload);
        state.loading = false;
        state.credits = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(getCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(CreditByDaily.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreditByDaily.fulfilled, (state, action) => {
        console.log("action5", action.payload);
        state.loading = false;
        state.dailyCredits = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(CreditByDaily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCredit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCredit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCreditError } = creditSlice.actions;
export default creditSlice.reducer;
