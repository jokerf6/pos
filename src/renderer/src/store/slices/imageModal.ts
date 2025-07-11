import { createSlice } from "@reduxjs/toolkit";

const imageModalSlice = createSlice({
  name: "imageModal",
  initialState: {
    open: false,
    image: "",
  },
  reducers: {
    showImageModal: (state, action) => {
      console.log("showImageModal action", action);
      state.open = true;
      state.image = action.payload || "";
    },
    hideImageModal: (state) => {
      state.open = false;
      state.image = "";
    },
  },
});

export const { showImageModal, hideImageModal } = imageModalSlice.actions;
export default imageModalSlice.reducer;
