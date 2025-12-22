import clientPromise from "../lib/mongo.js";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("billing");
  const collection = db.collection("cheque_responses");

  // ---------------- GET CSV ----------------
  if (req.method === "GET") {
    const records = await collection.find({}).sort({ _id: 1 }).toArray();

    if (records.length === 0) {
      return res.status(404).json({ error: "No data available" });
    }

    const header =
      '"Reference Date","Cheque Number","Amount (Rs.)","Voucher Type","GSTIN/UIN","Name of Ledger"\n';

    const rows = records
      .map(r =>
        [
          r.reference_cheque_date || "",
          r.cheque_number,
          r.amount,
          r.voucher_type,
          r.gstin || "",
          r.name_of_ledger
        ]
          .map(v => `"${v}"`)
          .join(",")
      )
      .join("\n");

    const csv = header + rows + "\n";

    if (req.query.download === "true") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=response.csv"
      );
      return res.status(200).send(csv);
    }

    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(csv);
  }

  // ---------------- SAVE ENTRY ----------------
  if (req.method === "POST") {
    const {
      reference_cheque_date,
      cheque_number,
      amount,
      name_of_ledger,
      gstin
    } = req.body;

    if (!cheque_number || !amount || !name_of_ledger) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await collection.insertOne({
      reference_cheque_date,
      cheque_number,
      amount,
      voucher_type: "Receipt",
      gstin,
      name_of_ledger,
      created_at: new Date()
    });

    return res.status(200).json({ status: "success" });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
