import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold">
          InvoiceStack
        </Link>
        <Link to="/" className="text-sm hover:underline">
          Dashboard
        </Link>
        <Link to="/invoices" className="text-sm hover:underline">
          Invoices
        </Link>
        <Link to="/invoices/create" className="text-sm hover:underline">
          New Invoice
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-indigo-200">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-700 text-sm px-3 py-1 rounded hover:bg-indigo-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
