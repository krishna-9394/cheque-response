import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const CSV_FILE = path.join(DATA_DIR, "response.csv");

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Ensure CSV exists with headers
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(
    CSV_FILE,
    "reference_cheque_date,cheque_number,amount,name_of_ledger,under,state_name,gst_registration_type,gstin,timestamp\n"
  );
}

app.post("/api/cheque", async (req, res) => {
  try {
    const {
      reference_cheque_date,
      cheque_number,
      amount,
      name_of_ledger,
      under,
      state_name,
      gst_registration_type,
      gstin
    } = req.body;

    if (!cheque_number || !amount || !name_of_ledger) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const row = [
      reference_cheque_date || "",
      cheque_number,
      amount,
      name_of_ledger,
      under,
      state_name,
      gst_registration_type,
      gstin,
      new Date().toISOString()
    ]
      .map(v => `"${v}"`)
      .join(",") + "\n";

    await fs.appendFile(CSV_FILE, row);

    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
