import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoicesByUserId,
  getInvoiceStatsByUserId,
  updateInvoice,
} from "../models/invoiceModel.js";

export async function getAllInvoices(req, res) {
  try {
    const invoices = await getInvoicesByUserId(req.user.id);
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getInvoiceStats(req, res) {
  try {
    const stats = await getInvoiceStatsByUserId(req.user.id);
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getSingleInvoice(req, res) {
  try {
    const invoice = await getInvoiceById(req.user.id, req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.json(invoice);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createNewInvoice(req, res) {
  const data = req.body;

  try {
    const invoiceId = await createInvoice({
      ...data,
      user_id: req.user.id,
    });

    return res.json({ message: "Invoice created", id: invoiceId });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateSingleInvoice(req, res) {
  const data = req.body;

  try {
    const invoice = await getInvoiceById(req.user.id, req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await updateInvoice(req.user.id, req.params.id, data);

    return res.json({ message: "Invoice updated" });
  } catch (error) {
    return res.status(500).json({ message: "Update failed" });
  }
}

export async function deleteSingleInvoice(req, res) {
  try {
    const invoice = await getInvoiceById(req.user.id, req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await deleteInvoice(req.user.id, req.params.id);

    return res.json({ message: "Invoice deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Delete failed" });
  }
}
