const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get all invoices for logged in user
router.get("/", auth, (req, res) => {
  db.query(
    "SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// Get dashboard stats
router.get("/stats", auth, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
      SUM(total) as total_revenue,
      SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as paid_revenue
    FROM invoices WHERE user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results[0]);
    }
  );
});

// Get single invoice with items
router.get("/:id", auth, (req, res) => {
  db.query(
    "SELECT * FROM invoices WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, invoices) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (invoices.length === 0)
        return res.status(404).json({ message: "Invoice not found" });

      db.query(
        "SELECT * FROM invoice_items WHERE invoice_id = ?",
        [req.params.id],
        (err2, items) => {
          if (err2) return res.status(500).json({ message: "Server error" });
          res.json({ ...invoices[0], items });
        }
      );
    }
  );
});

// Create invoice
router.post("/", auth, (req, res) => {
  const {
    invoice_number, client_name, client_email, client_address,
    issue_date, due_date, status, notes, payment_terms,
    subtotal, tax_percent, total, items,
  } = req.body;

  db.query(
    `INSERT INTO invoices (user_id, invoice_number, client_name, client_email, client_address, 
      issue_date, due_date, status, notes, payment_terms, subtotal, tax_percent, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, invoice_number, client_name, client_email, client_address,
      issue_date, due_date, status || "draft", notes, payment_terms, subtotal, tax_percent, total],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error", err });
      const invoiceId = result.insertId;

      if (items && items.length > 0) {
        const itemValues = items.map((item) => [
          invoiceId, item.description, item.quantity, item.rate, item.amount,
        ]);
        db.query(
          "INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES ?",
          [itemValues],
          (err2) => {
            if (err2) return res.status(500).json({ message: "Items insert failed" });
            res.json({ message: "Invoice created", id: invoiceId });
          }
        );
      } else {
        res.json({ message: "Invoice created", id: invoiceId });
      }
    }
  );
});

// Update invoice
router.put("/:id", auth, (req, res) => {
  const {
    client_name, client_email, client_address,
    issue_date, due_date, status, notes, payment_terms,
    subtotal, tax_percent, total, items,
  } = req.body;

  db.query(
    `UPDATE invoices SET client_name=?, client_email=?, client_address=?, issue_date=?, due_date=?,
      status=?, notes=?, payment_terms=?, subtotal=?, tax_percent=?, total=?
     WHERE id=? AND user_id=?`,
    [client_name, client_email, client_address, issue_date, due_date,
      status, notes, payment_terms, subtotal, tax_percent, total,
      req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });

      // Delete old items and insert new ones
      db.query("DELETE FROM invoice_items WHERE invoice_id = ?", [req.params.id], (err2) => {
        if (err2) return res.status(500).json({ message: "Item delete failed" });

        if (items && items.length > 0) {
          const itemValues = items.map((item) => [
            req.params.id, item.description, item.quantity, item.rate, item.amount,
          ]);
          db.query(
            "INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES ?",
            [itemValues],
            (err3) => {
              if (err3) return res.status(500).json({ message: "Item insert failed" });
              res.json({ message: "Invoice updated" });
            }
          );
        } else {
          res.json({ message: "Invoice updated" });
        }
      });
    }
  );
});

// Delete invoice
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM invoices WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Delete failed" });
      res.json({ message: "Invoice deleted" });
    }
  );
});

module.exports = router;
