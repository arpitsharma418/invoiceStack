import { useNavigate } from "react-router-dom";
import InvoiceForm from "../components/InvoiceForm.js";
import API from "../api.js";

export default function CreateInvoice() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    try {
      const res = await API.post("/invoices", data);
      navigate(`/invoices/preview/${res.data.id}`);
    } catch (err) {
      alert("Failed to create invoice");
    }
  }

  return <InvoiceForm onSubmit={handleSubmit} submitLabel="Create" />;
}
