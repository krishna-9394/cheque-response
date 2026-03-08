import express from "express";
import { createCheque, getCheques } from "../controllers/cheque.controller.js";

const router = express.Router();

router.post("/", createCheque);
router.get("/", getCheques);

export default router;