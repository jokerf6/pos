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
      {/* <Route
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
      /> */}
      <Route
        path="/users"
        element={
          <Layout>
            <UsersPage />
          </Layout>
        }
      />
      <Route
        path="/users/:id"
        element={
          <Layout>
            <EditUserPage />
          </Layout>
        }
      />
      <Route
        path="/users/create"
        element={
          <Layout>
            <CreateUserPage />
          </Layout>
        }
      />

      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
