import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const filePath = path.join("/tmp", "response.csv");

  // ---------------- GET CSV ----------------
  if (req.method === "GET") {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "response.csv not found" });
    }

    const file = fs.readFileSync(filePath, 'utf8');

    if (req.query.download === "true") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=response.csv"
      );
      return res.status(200).send(file);
    } else {
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send(file);
    }
  }

  // ---------------- SAVE ENTRY ----------------
  if (req.method === "POST") {
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

      // Create CSV with headers if it does not exist
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          '"Reference Date","Cheque Number","Amount (Rs.)","Voucher Type","GSTIN/UIN","Name of Ledger"\n'
        );
      }

      const row =
        [
          reference_cheque_date || "",
          cheque_number,
          amount,
          "Receipt",
          gstin,
          name_of_ledger
        ]
          .map(v => `"${v}"`)
          .join(",") + "\n";

      fs.appendFileSync(filePath, row);

      return res.status(200).json({ status: "success" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  // ---------------- METHOD NOT ALLOWED ----------------
  return res.status(405).json({ error: "Method Not Allowed" });
}
