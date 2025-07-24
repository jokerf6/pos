import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (data, { rejectWithValue }) => {
    console.log("in->", data);

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.create(data);
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

export const updateInvoice = createAsyncThunk(
  "invoice/update",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.update(data);
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

export const beforeInvoice = createAsyncThunk(
  "invoice/before",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.before(data);
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

export const getInvoice = createAsyncThunk(
  "invoice/getAll",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.getAll(data);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const afterInvoice = createAsyncThunk(
  "invoice/after",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.after(data);
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

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    invoice: [],
    total: 0,
    loading: false,
    selectedInvoice: null,
    error: null,
  },
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInvoice.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.loading = false;
        state.invoice = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(getInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
