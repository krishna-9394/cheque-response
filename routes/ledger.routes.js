import express from "express";
import { createLedger, getLedgers } from "../controllers/ledger.controller.js";

const router = express.Router();

router.post("/", createLedger);
router.get("/", getLedgers);

export default router;