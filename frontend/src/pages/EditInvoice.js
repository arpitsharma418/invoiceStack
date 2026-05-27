import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InvoiceForm from "../components/InvoiceForm.js";
import API from "../api.js";

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    API.get(`/invoices/${id}`).then((res) => {
      // Format dates for input fields
      const data = res.data;
      data.issue_date = data.issue_date?.split("T")[0];
      data.due_date = data.due_date?.split("T")[0];
      setInvoice(data);
    });
  }, [id]);

  async function handleSubmit(data) {
    try {
      await API.put(`/invoices/${id}`, data);
      navigate(`/invoices/preview/${id}`);
    } catch (err) {
      alert("Failed to update invoice");
    }
  }

  if (!invoice)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <InvoiceForm
      initialData={invoice}
      onSubmit={handleSubmit}
      submitLabel="Update"
    />
  );
}
