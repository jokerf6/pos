import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  buy_price: number;
  barcode?: string;
  generated_code?: string;
  category_id: number;
  created_at?: string;
  updated_at?: string;
}

interface ProductPayload {
  name: string;
  description: string;
  quantity: number;
  price: number;
  buy_price: number;
  barcode?: string;
  generated_code?: string;
  category_id: number;
}

interface UpdateProductPayload extends ProductPayload {
  id: number;
}

interface ProductsState {
  products: Product[];
  total: number;
  loading: boolean;
  selectedProduct: Product | null;
  error: string | null;
}

interface GetProductsPayload {
  limit?: number;
  offset?: number;
  page?: number;
}

interface SearchProductsPayload {
  name: string;
  page?: number;
}

// Async thunks
export const getProducts = createAsyncThunk(
  "products/getAll",
  async (data: GetProductsPayload = {}, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getAll(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateBarCode = createAsyncThunk(
  "products/generateBarCode",
  async (data: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.generateBarCode(data);
        console.log("Generating barcode...", result);
        return result.barcode;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/search",
  async (data: any, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.search(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (data: ProductPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.create(data);
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

export const updateProduct = createAsyncThunk(
  "products/update",
  async (data: UpdateProductPayload, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.update(data);
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

export const ProductById = createAsyncThunk(
  "products/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getById(id);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const ProductByBarcode = createAsyncThunk(
  "products/getByBarcode",
  async (data: any, { rejectWithValue }) => {
    console.log("Barcode data:", data);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getByBarcode(
          data.name
        );
        console.log("getByBarcode result:", result);
        return result.product;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.delete(id);
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
const initialState: ProductsState = {
  products: [],
  total: 0,
  loading: false,
  selectedProduct: null,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(ProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(ProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.loading = false;
        state.products = action.payload?.products || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
