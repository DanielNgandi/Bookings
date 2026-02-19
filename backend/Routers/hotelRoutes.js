import express from "express";
import { addHotel } from "../Controllers/hotelController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, addHotel);

export default router;
