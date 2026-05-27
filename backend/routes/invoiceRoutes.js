import { Router } from "express";

import {
  createNewInvoice,
  deleteSingleInvoice,
  getAllInvoices,
  getInvoiceStats,
  getSingleInvoice,
  updateSingleInvoice,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getAllInvoices);
router.get("/stats", authMiddleware, getInvoiceStats);
router.get("/:id", authMiddleware, getSingleInvoice);
router.post("/", authMiddleware, createNewInvoice);
router.put("/:id", authMiddleware, updateSingleInvoice);
router.delete("/:id", authMiddleware, deleteSingleInvoice);

export default router;