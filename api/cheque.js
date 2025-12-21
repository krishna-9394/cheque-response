import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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

    // Vercel writable temp directory
    const filePath = path.join("/tmp", "response.csv");

    // Create CSV with headers if not exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        "reference_cheque_date,cheque_number,amount,name_of_ledger,under,state_name,gst_registration_type,gstin,timestamp\n"
      );
    }

    const row =
      [
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

    fs.appendFileSync(filePath, row);

    return res.status(200).json({ status: "success" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
