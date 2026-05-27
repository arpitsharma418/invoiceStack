import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api.js";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const res = await API.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.log("Error fetching invoices");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await API.delete(`/invoices/${id}`);
      setInvoices(invoices.filter((inv) => inv.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  }

  const statusColors = {
    paid: "bg-green-100 text-green-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Invoices</h1>
        <Link
          to="/invoices/create"
          className="bg-black text-white px-4 py-2 rounded hover:bg-black/80 text-sm"
        >
          New Invoice
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by client or invoice number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-black"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border border-dashed border-black/20 rounded">
          <p>No invoices found.</p>
          <Link
            to="/invoices/create"
            className="text-sm text-blue-600 hover:underline"
          >
            Create Your First Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">Invoice #</th>
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3">Issue Date</th>
                <th className="text-left px-5 py-3">Due Date</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-indigo-600">
                    {inv.invoice_number}
                  </td>
                  <td className="px-5 py-3">{inv.client_name}</td>
                  <td className="px-5 py-3">
                    {new Date(inv.issue_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    ₹{parseFloat(inv.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/invoices/preview/${inv.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/invoices/edit/${inv.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
