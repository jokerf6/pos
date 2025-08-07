import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface InvoiceItem {
  product_id: number;
  quantity: number;
  price: number;
  total: number;
}

interface InvoicePayload {
  items: InvoiceItem[];
  total_amount: number;
  customer_info?: any;
  payment_method?: string;
}

interface UpdateInvoicePayload extends InvoicePayload {
  id: number;
}

interface InvoiceState {
  loading: boolean;
  error: string | null;
  currentInvoice: any | null;
}

// Async thunks
export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (data: any, { rejectWithValue }) => {
    console.log("in->", data);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.create(data);
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

export const updateInvoice = createAsyncThunk(
  "invoice/update",
  async (data: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.update(data);
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

export const beforeInvoice = createAsyncThunk(
  "invoice/before",
  async (data: any, { rejectWithValue }) => {
    try {
      console.log("beforeInvoice filter", data);
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.before(data);
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

export const afterInvoice = createAsyncThunk(
  "invoice/after",
  async (data: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoice.after(data);
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

// Initial state
const initialState: InvoiceState = {
  loading: false,
  error: null,
  currentInvoice: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(beforeInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(beforeInvoice.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(beforeInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
