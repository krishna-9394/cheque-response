import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/mongo.js";

import ledgerRoutes from "./routes/ledger.routes.js";
import chequeRoutes from "./routes/cheque.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api/ledgers", ledgerRoutes);
app.use("/api/cheques", chequeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});