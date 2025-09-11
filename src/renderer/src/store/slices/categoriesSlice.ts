import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Category {
  id: number;
  name: string;
  image?: {
    name: string;
    type: string;
    buffer: number[];
  } | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoryPayload {
  name: string;
  image?: {
    name: string;
    type: string;
    buffer: number[];
  } | null;
}

interface UpdateCategoryPayload extends CategoryPayload {
  id: number;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  selectedCategory: Category | null;
  error: string | null;
}

// Async thunks
export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (data: void, { rejectWithValue }) => {
    console.log(window.electronAPI);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.getAll();
        console.log("getCategories result", result);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      console.log("error", error);
      return rejectWithValue(error.message);
    }
  }
);

export const searchCategories = createAsyncThunk(
  "categories/search",
  async (name: string, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.search(name);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (data: CategoryPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.create(data);
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

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (data: UpdateCategoryPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.update(data);
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

export const CategoryById = createAsyncThunk(
  "categories/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.getById(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.categories.delete(id);
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
const initialState: CategoryState = {
  categories: [],
  loading: false,
  selectedCategory: null,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(CategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(CategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.loading = false;
        state.categories = action.payload?.data || [];
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
