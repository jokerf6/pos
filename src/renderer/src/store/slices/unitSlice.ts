import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";




// Async thunks
export const getAll = createAsyncThunk(
  "units/getAll",
  async (_: any, { rejectWithValue }) => {
    try {
      console.log("Fetching units...");
      if (window.electronAPI) {
        console.log("Using Electron API to fetch units");
        const result = await window.electronAPI.units.getAll();
        console.log(result);
        console.log("Units fetched:", result);
        return result;
      } 
    } catch (error: any) {
      console.log("Error fetching units:", error);
      return rejectWithValue(error.message);
    }
  }
);


export const createUnit = createAsyncThunk(
  "units/create",
  async (newUnit: any, { rejectWithValue }) => {
    console.log("hi form create unit")
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.units.create(newUnit);
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

export const updateUnit = createAsyncThunk(
  "units/update",
  async (unitData: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.units.update(unitData);
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

export const deleteUnit = createAsyncThunk(
  "units/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.units.delete(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
interface UnitState {
  units: any[];
  total: number;
  loading: boolean;
  selectedUnit: any | null;
  error: string | null;
}

const initialState: UnitState = {
  units: [],
  total: 0,
  loading: false,
  selectedUnit: null,
  error: null,
};

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    clearUnitsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    

      .addCase(getAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAll.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload?.units || [];
      })
      .addCase(getAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUnitsError } = unitSlice.actions;
export default unitSlice.reducer;
