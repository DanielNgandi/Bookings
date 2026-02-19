import express from "express";
import { createBooking, getAllBookings, getSingleBooking} from "../Controllers/bookingController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getAllBookings);
router.get("/:id", protect, getSingleBooking);

export default router;
