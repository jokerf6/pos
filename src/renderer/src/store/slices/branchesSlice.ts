import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Branch {
  id: number;
  name: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

interface BranchPayload {
  name: string;
  address: string;
}


interface BranchesState {
  branches: Branch[];
  total: number;
  loading: boolean;
  selectedBranch: Branch | null;
  error: string | null;
}

interface GetBranchesPayload {
  limit?: number;
  offset?: number;
  page?: number;
}

interface SearchBranchesPayload {
  name: string;
  page?: number;
}

// Async thunks
export const getBranches = createAsyncThunk(
  "branches/getAll",
  async (data: GetBranchesPayload = {}, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.branches.getAll(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

  export const getAllBranches = createAsyncThunk(
    "branches/getAllWithoutPagination",
  async (data: GetBranchesPayload = {}, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.branches.getAllWithoutPagination();
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchBranches = createAsyncThunk(
  "branches/search",
  async (data: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.branches.search(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBranch = createAsyncThunk(
  "branches/create",
  async (data: BranchPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.branches.create(data);
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

export const deleteBranch = createAsyncThunk(
  "branches/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.branches.delete(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);




export const switchBranch = createAsyncThunk(
  "branches/switch",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        console.log("switched to branch", id);
        const result = await window.electronAPI.branches.switch(id);
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
const initialState: BranchesState = {
  branches: [],
  total: 0,
  loading: false,
  selectedBranch: null,
  error: null,
};

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
      clearBranches: (state) => {
    state.selectedBranch = null;
  },
    clearBranchesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload?.branches || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

     .addCase(getAllBranches.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload?.branches || [];
      })
      .addCase(getAllBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })



       .addCase(searchBranches.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload?.branches || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(searchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(switchBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(switchBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBranch = action.payload.data || null;
      })
      .addCase(switchBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

     



      .addCase(createBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBranchesError,clearBranches } = branchesSlice.actions;
export default branchesSlice.reducer;
