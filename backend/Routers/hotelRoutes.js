import express from "express";
import { addHotel, getHotels} from "../Controllers/hotelController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, addHotel);
//router.get("/", protect, getHotels);
router.get("/", protect, getHotels);

export default router;
