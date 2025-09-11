import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  granted_at?: string;
  granted_by?: number;
}

interface UserPermission {
  userId: number;
  permissionId: number;
  grantedBy: number;
}

interface PermissionsState {
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
  userPermissions: Permission[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const getAllPermissions = createAsyncThunk(
  "permissions/getAll",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.getAll();
        return result;
      } else {
        return { permissions: [] };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPermissionsByCategory = createAsyncThunk(
  "permissions/getByCategory",
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.getByCategory();
        return result;
      } else {
        return { permissions: {} };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserPermissions = createAsyncThunk(
  "permissions/getUserPermissions",
  async (userId: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.getUserPermissions({ userId });
        return result;
      } else {
        return { permissions: [] };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  "permissions/updateUserPermissions",
  async (data: { userId: number; permissionIds: number[]; grantedBy: number }, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.updateUserPermissions(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const grantPermission = createAsyncThunk(
  "permissions/grant",
  async (data: UserPermission, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.grant(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const revokePermission = createAsyncThunk(
  "permissions/revoke",
  async (data: { userId: number; permissionId: number }, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.revoke(data);
        return result;
      } else {
        return null;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const hasPermission = createAsyncThunk(
  "permissions/hasPermission",
  async (data: { userId: number; permissionName: string }, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.permissions.hasPermission(data);
        return result;
      } else {
        return { hasPermission: false };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState: PermissionsState = {
  permissions: [],
  permissionsByCategory: {},
  userPermissions: [],
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearPermissionsError: (state) => {
      state.error = null;
    },
    clearUserPermissions: (state) => {
      state.userPermissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload?.permissions || [];
      })
      .addCase(getAllPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getPermissionsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPermissionsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionsByCategory = action.payload?.permissions || {};
      })
      .addCase(getPermissionsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload?.permissions || [];
      })
      .addCase(getUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(grantPermission.pending, (state) => {
        state.loading = true;
      })
      .addCase(grantPermission.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(grantPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(revokePermission.pending, (state) => {
        state.loading = true;
      })
      .addCase(revokePermission.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(revokePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPermissionsError, clearUserPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;

