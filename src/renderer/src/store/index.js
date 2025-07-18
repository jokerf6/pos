import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import confirmModalReducer from "./slices/confirmModalSlice";
import imageModalSlice from "./slices/imageModal";
import productsReducer from "./slices/productsSlice"; // Importing products slice
import dailyReducer from "./slices/dailySlice"; // Importing daily slice
import creditReducer from "./slices/creditSlice"; // Importing credit slice
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    categories: categoriesReducer,
    products: productsReducer, // Importing products slice
    daily: dailyReducer,
    credit: creditReducer, // Importing credit slice
    confirmModal: confirmModalReducer,
    imageModal: imageModalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
