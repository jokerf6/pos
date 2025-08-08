import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";



// Get all settings
export const getTransaction = createAsyncThunk<any[], any, { rejectValue: string }>(
  "get-product-transactions",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.transactions.getProductTransactions(data);
        return result;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


interface TransactionState {
  transaction: any[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transaction: null,
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all cases
      .addCase(getTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransaction.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Transaction data:", action.payload);
        state.transaction = action.payload;
        state.error = null;
      })
      .addCase(getTransaction.rejected, (state, action) => {
        state.loading = false;
      })

  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
