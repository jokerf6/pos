import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getProducts = createAsyncThunk(
  "products/getAll",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getAll(data);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateBarCode = createAsyncThunk(
  "products/generateBarCode",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.generateBarCode();
        console.log("Generating barcode...", result);

        return result.barcode;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/search",
  async (name, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.search(name);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.create(data);
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

export const updateProduct = createAsyncThunk(
  "products/update",
  async (data, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.update(data);
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

export const ProductById = createAsyncThunk(
  "products/getById",
  async (id, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getById(id);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const ProductByBarcode = createAsyncThunk(
  "products/getByBarcode",
  async (data, { rejectWithValue }) => {
    console.log("Barcode data:", data);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.getByBarcode(data);
        console.log("getByBarcode result:", result);
        return result.product;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.products.delete(id);
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    total: 0,
    loading: false,
    selectedProduct: null,
    error: null,
  },
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
        state.error = action.payload;
      })

      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        console.log("action", action.payload);
        state.loading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
