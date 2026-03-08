import express from "express";
import cors from "cors";

import ledgerRoutes from "./routes/ledger.routes.js";
import chequeRoutes from "./routes/cheque.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ledgers", ledgerRoutes);
app.use("/api/cheques", chequeRoutes);

export default app;