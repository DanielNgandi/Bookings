import express from "express";
import { createPayment } from "../Controllers/paymentController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createPayment);

export default router;
