import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ReportState {
  financialSummary: any | null;
  inventory: any | null;
  productPerformance: any | null;
  dailySales: any | null;
  monthlySales: any | null;
  cashierPerformance: any | null;
  loading: boolean;
  error: string | null;
}


export const exportReportPDF = createAsyncThunk<
  any[],
  any,
  { rejectValue: string }
>("pdf/generate-report", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.pdf.generateReport(data);
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Get all settings
export const cashierPerformance = createAsyncThunk<
  any,
  { from: Date; to: Date,page:number },
  { rejectValue: string }
>("reports/cashier-performance", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.reports.cashierPerformance(data);
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const dailySales = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("reports/daily-sales", async (_, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.reports.dailySales();
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const monthlySales = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("reports/monthly-sales", async (_, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.reports.monthlySales();
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const productPerformance = createAsyncThunk<
  any,
  { from: Date; to: Date, page:any },
  { rejectValue: string }
>("reports/product-performance", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.reports.productPerformance(data);
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const inventory = createAsyncThunk<any, any, { rejectValue: string }>(
  "reports/inventory",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.reports.inventory(data);
        return result;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const financialSummary = createAsyncThunk<
  any,
  { from: Date; to: Date },
  { rejectValue: string }
>("reports/financial-summary", async (data, { rejectWithValue }) => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.reports.getFinancialSummaryReport({ from: data.from, to: data.to });
      return result;
    } else {
      return [];
    }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: ReportState = {
  financialSummary: null,
  inventory: null,
  productPerformance: null,
  monthlySales: null,
  dailySales: null,
  cashierPerformance: null,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all cases



            .addCase(financialSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(financialSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.financialSummary = action.payload.data as any;
        console.log("financialSummary", action.payload);
        state.error = null;
      })
      .addCase(financialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get financial summary data";
      })

                  .addCase(inventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.data as any;
        console.log("inventory", action.payload);
        state.error = null;
      })
      .addCase(inventory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get inventory data";
      })

               .addCase(cashierPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cashierPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.cashierPerformance = action.payload.data as any;
        console.log("cashierPerformance", action.payload);
        state.error = null;
      })
      .addCase(cashierPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get inventory data";
      })

                   .addCase(productPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(productPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.productPerformance = action.payload.data as any;
        console.log("productPerformance", action.payload);
        state.error = null;
      })
      .addCase(productPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get inventory data";
      })


                      .addCase(monthlySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(monthlySales.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlySales = action.payload.data as any;
        console.log("monthlySales", action.payload);
        state.error = null;
      })
      .addCase(monthlySales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get inventory data";
      })

                        .addCase(dailySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dailySales.fulfilled, (state, action) => {
        state.loading = false;
        state.dailySales = action.payload.data as any;
        console.log("dailySales", action.payload);
        state.error = null;
      })
      .addCase(dailySales.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to get inventory data";
      });


 
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
