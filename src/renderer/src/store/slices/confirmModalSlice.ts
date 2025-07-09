import { createSlice } from "@reduxjs/toolkit";

const confirmModalSlice = createSlice({
  name: "confirmModal",
  initialState: {
    open: false,
    itemLabel: "",
    onConfirm: null as null | (() => void),
  },
  reducers: {
    showConfirmModal: (state, action) => {
      state.open = true;
      state.itemLabel = action.payload.itemLabel || "";
      state.onConfirm = action.payload.onConfirm;
    },
    hideConfirmModal: (state) => {
      state.open = false;
      state.itemLabel = "";
      state.onConfirm = null;
    },
  },
});

export const { showConfirmModal, hideConfirmModal } = confirmModalSlice.actions;
export default confirmModalSlice.reducer;
