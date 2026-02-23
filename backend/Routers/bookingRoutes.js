import express from "express";
import { createBooking, getAllBookings, getSingleBooking,downloadInvoice,downloadVoucher,downloadReceipt} from "../Controllers/bookingController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getAllBookings);

router.get("/invoice/:id", protect, downloadInvoice);
router.get("/voucher/:id", protect, downloadVoucher);
router.get("/:id/receipt", protect, downloadReceipt);

router.get("/:id", protect, getSingleBooking);

export default router;
