import { useState } from "react";

// Empty item template
const emptyItem = { description: "", quantity: 1, rate: 0, amount: 0 };

export default function InvoiceForm({ initialData, onSubmit, submitLabel }) {
  const [form, setForm] = useState(
    initialData || {
      invoice_number: `INV-${Date.now()}`.slice(0, 12),
      client_name: "",
      client_email: "",
      client_address: "",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      notes: "",
      payment_terms: "",
      tax_percent: 0,
    },
  );
  const [items, setItems] = useState(initialData?.items || [{ ...emptyItem }]);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0,
  );
  const taxAmount = (subtotal * parseFloat(form.tax_percent || 0)) / 100;
  const total = subtotal + taxAmount;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    // Auto-calculate amount when qty or rate changes
    if (field === "quantity" || field === "rate") {
      updated[index].amount = (
        parseFloat(updated[index].quantity || 0) *
        parseFloat(updated[index].rate || 0)
      ).toFixed(2);
    }
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, subtotal, total, items };
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {submitLabel === "Update" ? "Edit Invoice" : "Create Invoice"}
      </h1>

      {/* Basic Info */}
      <div className="bg-white rounded border p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Invoice Number
            </label>
            <input
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2 focus:ring-1 focus:ring-black text-sm focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Issue Date
            </label>
            <input
              type="date"
              name="issue_date"
              value={form.issue_date}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white border p-5 mb-5 rounded">
        <h2 className="font-semibold text-gray-700 mb-4">Client Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Client Name
            </label>
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Client or Company Name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Client Email
            </label>
            <input
              type="email"
              name="client_email"
              value={form.client_email}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="client@email.com"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-600">
              Client Address
            </label>
            <textarea
              name="client_address"
              value={form.client_address}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Client address..."
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded border p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Items / Services</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Rate"
                  min="0"
                  value={item.rate}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="col-span-2">
                <input
                  readOnly
                  value={`₹${parseFloat(item.amount || 0).toFixed(2)}`}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex justify-between items-center">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex items-center justify-center bg-zinc-100 p-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20px"
                      viewBox="0 -960 960 960"
                      width="20px"
                      fill="#1f1f1f"
                    >
                      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm text-indigo-600 hover:underline"
        >
          + Add Item
        </button>

        {/* Totals */}
        <div className="mt-5 border-t pt-4 flex flex-col items-end gap-1 text-sm">
          <div className="flex gap-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">Tax (%):</span>
            <input
              type="number"
              name="tax_percent"
              value={form.tax_percent}
              onChange={handleChange}
              min="0"
              max="100"
              className="mt-1 w-16 border rounded py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600">Tax Amount:</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 text-base font-bold text-gray-800">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Additional Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Invoice notes..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Payment Terms
            </label>
            <textarea
              name="payment_terms"
              value={form.payment_terms}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Payment terms..."
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded hover:bg-black/80 text-sm"
      >
        {loading ? "Saving..." : `${submitLabel} Invoice`}
      </button>
    </form>
  );
}
