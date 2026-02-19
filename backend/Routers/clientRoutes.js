import express from "express";
import { addClient } from "../Controllers/clientController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, addClient);

export default router;
