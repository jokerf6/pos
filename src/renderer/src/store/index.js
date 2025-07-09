import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import confirmModalReducer from "./slices/confirmModalSlice"; // Uncomment if you have a confirm modal slice
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    confirmModal: confirmModalReducer, // Add confirm modal slice to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
