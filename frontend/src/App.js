import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InvoiceList from "./pages/InvoiceList";
import CreateInvoice from "./pages/CreateInvoice";
import EditInvoice from "./pages/EditInvoice";
import InvoicePreview from "./pages/InvoicePreview";
import Navbar from "./components/Navbar";
import "./index.css";

// Protect routes - redirect to login if not logged in
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
        <Route path="/invoices/create" element={<PrivateRoute><CreateInvoice /></PrivateRoute>} />
        <Route path="/invoices/edit/:id" element={<PrivateRoute><EditInvoice /></PrivateRoute>} />
        <Route path="/invoices/preview/:id" element={<PrivateRoute><InvoicePreview /></PrivateRoute>} />
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
