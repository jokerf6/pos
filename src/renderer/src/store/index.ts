import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import permissionsReducer from "./slices/permissionsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import confirmModalReducer from "./slices/confirmModalSlice";
import imageModalSlice from "./slices/imageModal";
import productsReducer from "./slices/productsSlice"; // Importing products slice
import dailyReducer from "./slices/dailySlice"; // Importing daily slice
import creditReducer from "./slices/creditSlice"; // Importing credit slice
import invoiceReducer from "./slices/invoice"; // Importing invoice slice
import settingsReducer from "./slices/settingsSlice"; // Importing invoice slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    categories: categoriesReducer,
    products: productsReducer, // Importing products slice
    daily: dailyReducer,
    credit: creditReducer, // Importing credit slice
    invoice: invoiceReducer, // Importing invoice slice
    confirmModal: confirmModalReducer,
    settings: settingsReducer,
    imageModal: imageModalSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
