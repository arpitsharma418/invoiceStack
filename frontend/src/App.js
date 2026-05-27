import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./AuthContext.js";

import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import InvoiceList from "./pages/InvoiceList.js";
import CreateInvoice from "./pages/CreateInvoice.js";
import EditInvoice from "./pages/EditInvoice.js";
import InvoicePreview from "./pages/InvoicePreview.js";
import Navbar from "./components/Navbar.js";

import "./index.css";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <InvoiceList />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/create"
          element={
            <PrivateRoute>
              <CreateInvoice />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/edit/:id"
          element={
            <PrivateRoute>
              <EditInvoice />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/preview/:id"
          element={
            <PrivateRoute>
              <InvoicePreview />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
