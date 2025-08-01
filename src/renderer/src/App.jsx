import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import HomePage from "./pages/Home/HomePage";
import { checkAuth } from "./store/slices/authSlice";
import { Layout } from "./layouts/index.layout"; // ✅
import UsersPage from "./pages/Users/index"; // ✅
import EditUserPage from "./pages/Users/EditUserPage";
import CreateUserPage from "./pages/Users/CreateUserPage"; // ✅
import CategoriesPage from "./pages/Categories/index"; // ✅
import CreateCategoryPage from "./pages/Categories/CreateCategoryPage"; // ✅
import EditCategoryPage from "./pages/Categories/EditCategoryPage"; // ✅
import ProductsPage from "./pages/Products/index"; // ✅
import CreateProductPage from "./pages/Products/CreateProductPage"; // ✅
import EditProductPage from "./pages/Products/EditProductPage"; // ✅
import CreditPage from "./pages/Credit/CreditPage";
import CreditDailyPage from "./pages/Credit/CreditDailyPage";
import InvoicePage from "./pages/Invoice/InvoicePage"; // ✅
import CreateInvoicePage from "./pages/Invoice/create-invoicePage"; // ✅
import SettingsPage from "./pages/Settings/index"; // ✅

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <HomePage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated ? (
            <Layout>
              <UsersPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/users/:id"
        element={
          isAuthenticated ? (
            <Layout>
              <EditUserPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/users/create"
        element={
          isAuthenticated ? (
            <Layout>
              <CreateUserPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/categories"
        element={
          isAuthenticated ? (
            <Layout>
              <CategoriesPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/categories/create"
        element={
          isAuthenticated ? (
            <Layout>
              <CreateCategoryPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/categories/:barcode"
        element={
          isAuthenticated ? (
            <Layout>
              <EditCategoryPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/invoice/create"
        element={
          isAuthenticated ? (
            <Layout>
              <CreateInvoicePage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/invoice"
        element={
          isAuthenticated ? (
            <Layout>
              <InvoicePage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout>
              <SettingsPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/credit"
        element={
          isAuthenticated ? (
            <Layout>
              <CreditPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/credit/daily"
        element={
          isAuthenticated ? (
            <Layout>
              <CreditDailyPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products"
        element={
          isAuthenticated ? (
            <Layout>
              <ProductsPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products/create"
        element={
          isAuthenticated ? (
            <Layout>
              <CreateProductPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products/:id"
        element={
          isAuthenticated ? (
            <Layout>
              <EditProductPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <HomePage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
