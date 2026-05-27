import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const invoiceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invoice_number: {
      type: String,
      required: true,
      trim: true,
    },
    client_name: {
      type: String,
      required: true,
      trim: true,
    },
    client_email: {
      type: String,
      default: "",
      trim: true,
    },
    client_address: {
      type: String,
      default: "",
      trim: true,
    },
    issue_date: {
      type: Date,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    payment_terms: {
      type: String,
      default: "",
      trim: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax_percent: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

function serializeInvoice(invoice) {
  if (!invoice) {
    return null;
  }

  return {
    id: invoice._id.toString(),
    user_id: invoice.user_id.toString(),
    invoice_number: invoice.invoice_number,
    client_name: invoice.client_name,
    client_email: invoice.client_email || "",
    client_address: invoice.client_address || "",
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    status: invoice.status,
    notes: invoice.notes || "",
    payment_terms: invoice.payment_terms || "",
    subtotal: invoice.subtotal,
    tax_percent: invoice.tax_percent,
    total: invoice.total,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
  };
}

function normalizeInvoicePayload(invoice) {
  return {
    user_id: invoice.user_id,
    invoice_number: invoice.invoice_number,
    client_name: invoice.client_name,
    client_email: invoice.client_email || "",
    client_address: invoice.client_address || "",
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    status: invoice.status || "draft",
    notes: invoice.notes || "",
    payment_terms: invoice.payment_terms || "",
    subtotal: Number(invoice.subtotal || 0),
    tax_percent: Number(invoice.tax_percent || 0),
    total: Number(invoice.total || 0),
    items: (invoice.items || []).map((item) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      rate: Number(item.rate || 0),
      amount: Number(item.amount || 0),
    })),
  };
}

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export async function getInvoicesByUserId(userId) {
  const invoices = await Invoice.find({ user_id: userId }).sort({ createdAt: -1 });
  return invoices.map(serializeInvoice);
}

export async function getInvoiceStatsByUserId(userId) {
  const [stats] = await Invoice.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        paid: {
          $sum: {
            $cond: [{ $eq: ["$status", "paid"] }, 1, 0],
          },
        },
        draft: {
          $sum: {
            $cond: [{ $eq: ["$status", "draft"] }, 1, 0],
          },
        },
        sent: {
          $sum: {
            $cond: [{ $eq: ["$status", "sent"] }, 1, 0],
          },
        },
        overdue: {
          $sum: {
            $cond: [{ $eq: ["$status", "overdue"] }, 1, 0],
          },
        },
        total_revenue: { $sum: "$total" },
        paid_revenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "paid"] }, "$total", 0],
          },
        },
      },
    },
  ]);

  return (
    stats || {
      total: 0,
      paid: 0,
      draft: 0,
      sent: 0,
      overdue: 0,
      total_revenue: 0,
      paid_revenue: 0,
    }
  );
}

export async function getInvoiceById(userId, invoiceId) {
  if (!mongoose.isValidObjectId(invoiceId)) {
    return null;
  }

  const invoice = await Invoice.findOne({ _id: invoiceId, user_id: userId });
  return serializeInvoice(invoice);
}

export async function createInvoice(invoice) {
  const createdInvoice = await Invoice.create(normalizeInvoicePayload(invoice));
  return createdInvoice._id.toString();
}

export async function updateInvoice(userId, invoiceId, invoice) {
  if (!mongoose.isValidObjectId(invoiceId)) {
    return null;
  }

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId, user_id: userId },
    normalizeInvoicePayload({ ...invoice, user_id: userId }),
    { new: true, runValidators: true },
  );

  return serializeInvoice(updatedInvoice);
}

export async function deleteInvoice(userId, invoiceId) {
  if (!mongoose.isValidObjectId(invoiceId)) {
    return;
  }

  await Invoice.findOneAndDelete({ _id: invoiceId, user_id: userId });
}
