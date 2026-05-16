import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicePreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    API.get(`/invoices/${id}`).then((res) => setInvoice(res.data));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this invoice?")) return;
    await API.delete(`/invoices/${id}`);
    navigate("/invoices");
  }

  // Generate PDF using jsPDF directly from invoice data
  function downloadPDF() {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(67, 56, 202); // indigo
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 14, 30);
    doc.text(
      `Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`,
      14,
      36,
    );
    doc.text(
      `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`,
      14,
      42,
    );
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 48);

    // From (Business)
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("From:", 14, 60);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(user?.business_name || user?.name || "My Business", 14, 67);
    doc.text(user?.email || "", 14, 73);

    // To (Client)
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("Bill To:", 110, 60);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(invoice.client_name, 110, 67);
    if (invoice.client_email) doc.text(invoice.client_email, 110, 73);
    if (invoice.client_address) {
      const addressLines = doc.splitTextToSize(invoice.client_address, 80);
      doc.text(addressLines, 110, 79);
    }

    // Items Table
    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `Rs.${parseFloat(item.rate).toFixed(2)}`,
      `Rs.${parseFloat(item.amount).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      headStyles: { fillColor: [67, 56, 202] },
      styles: { fontSize: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Subtotal: Rs.${parseFloat(invoice.subtotal).toFixed(2)}`,
      140,
      finalY,
    );
    doc.text(
      `Tax (${invoice.tax_percent}%): Rs.${((invoice.subtotal * invoice.tax_percent) / 100).toFixed(2)}`,
      140,
      finalY + 7,
    );
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(
      `Total: Rs.${parseFloat(invoice.total).toFixed(2)}`,
      140,
      finalY + 16,
    );

    // Notes & Payment Terms
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Notes:", 14, finalY);
      const noteLines = doc.splitTextToSize(invoice.notes, 110);
      doc.text(noteLines, 14, finalY + 7);
    }

    if (invoice.payment_terms) {
      const ptY = invoice.notes ? finalY + 20 : finalY;
      doc.text("Payment Terms:", 14, ptY);
      const ptLines = doc.splitTextToSize(invoice.payment_terms, 110);
      doc.text(ptLines, 14, ptY + 7);
    }

    doc.save(`${invoice.invoice_number}.pdf`);
  }

  if (!invoice)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const statusColors = {
    paid: "bg-green-100 text-green-700",
    sent: "bg-blue-100 text-blue-700",
    draft: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/invoices" className="btn-secondary flex gap-1 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="17px"
            viewBox="0 -960 960 960"
            width="17px"
            fill="#1f1f1f"
          >
            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </svg>
          Back to Invoices
        </Link>
        <div className="flex gap-2">
          <Link to={`/invoices/edit/${id}`} className="btn-primary">
            Edit
          </Link>
          <button onClick={downloadPDF} className="btn-success">
            Download
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Preview Card */}
      <div className="bg-white border p-8">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">INVOICE</h1>
            <p className="text-gray-500 text-sm mt-1">
              {invoice.invoice_number}
            </p>
          </div>
          <span
            className={`text-xs font-medium`}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
              From
            </p>
            <p className="font-semibold text-gray-800">
              {user?.business_name || user?.name}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
              Bill To
            </p>
            <p className="font-semibold text-gray-800">{invoice.client_name}</p>
            <p className="text-sm text-gray-500">{invoice.client_email}</p>
            <p className="text-sm text-gray-500">{invoice.client_address}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-100 p-4">
          <div>
            <p className="text-xs text-gray-400">Issue Date</p>
            <p className="font-medium">
              {new Date(invoice.issue_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Due Date</p>
            <p className="font-medium">
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-blue-50 text-blue-700 border">
              <th className="text-left px-4 py-2 border">Description</th>
              <th className="text-center px-4 py-2 border">Qty</th>
              <th className="text-right px-4 py-2 border">Rate</th>
              <th className="text-right px-4 py-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  ₹{parseFloat(item.rate).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ₹{parseFloat(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({invoice.tax_percent}%)</span>
              <span>
                ₹{((invoice.subtotal * invoice.tax_percent) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-1">
              <span>Total</span>
              <span>₹{parseFloat(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.payment_terms) && (
          <div className="grid grid-cols-2 gap-6 border-t pt-5 text-sm">
            {invoice.notes && (
              <div>
                <p className="font-semibold text-gray-600 mb-1">Notes</p>
                <p className="text-gray-500">{invoice.notes}</p>
              </div>
            )}
            {invoice.payment_terms && (
              <div>
                <p className="font-semibold text-gray-600 mb-1">
                  Payment Terms
                </p>
                <p className="text-gray-500">{invoice.payment_terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
