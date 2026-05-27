import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";
import { useAuth } from "../AuthContext.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    API.get("/invoices/stats").then((res) => setStats(res.data));
    API.get("/invoices").then((res) => setRecentInvoices(res.data.slice(0, 5)));
  }, []);

  const statCards = [
    {
      label: "Total Invoices",
      value: stats?.total || 0,
    },
    {
      label: "Paid",
      value: stats?.paid || 0,
    },
    {
      label: "Sent",
      value: stats?.sent || 0,
    },
    {
      label: "Draft",
      value: stats?.draft || 0,
    },
    {
      label: "Overdue",
      value: stats?.overdue || 0,
    },
  ];

  const statusColors = {
    paid: "bg-green-100 text-green-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Good day, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.business_name
              ? `Business: ${user.business_name}`
              : "Welcome to your invoice dashboard"}
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="bg-black rounded text-white px-4 py-2 hover:bg-black/80 text-sm transition"
        >
          Create Invoice
        </Link>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-100 border p-5 rounded">
          <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            &#8377;{parseFloat(stats?.total_revenue || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-100 font-semibold p-5 border rounded">
          <p className="text-sm text-gray-500">Paid Revenue</p>
          <p className="text-xl font-bold text-green-700 mt-1">
            &#8377;{parseFloat(stats?.paid_revenue || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`p-4 text-center bg-zinc-100 border`}
          >
            <p className="text-2xl font-bold"></p>
            <p className="text-xs mt-1">{`${card.label} (${card.value})`}</p>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white border rounded">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-700">Recent Invoices</h2>
          <Link
            to="/invoices"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No invoices yet.</p>
            <Link
              to="/invoices/create"
              className="text-sm text-blue-600 hover:underline"
            >
              Create your first one
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">Invoice #</th>
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3">Due Date</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-blue-600">
                    {inv.invoice_number}
                  </td>
                  <td className="px-5 py-3">{inv.client_name}</td>
                  <td className="px-5 py-3">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    &#8377;{parseFloat(inv.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
