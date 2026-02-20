import express from "express";
import { addClient, getClients} from "../Controllers/clientController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, addClient);
//router.get("/", protect, getClients);
router.get("/", protect, getClients);



export default router;
