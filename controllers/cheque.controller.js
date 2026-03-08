import { ObjectId } from "mongodb";
import clientPromise from "../lib/mongo.js";

export const createCheque = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("billing");

    const {
      reference_cheque_date,
      cheque_number,
      amount,
      ledger_id
    } = req.body;

    if (!cheque_number || !amount || !ledger_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ledger = await db.collection("ledgers")
      .findOne({ _id: new ObjectId(ledger_id) });

    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }

    await db.collection("cheque_responses").insertOne({
      reference_cheque_date: reference_cheque_date
        ? new Date(reference_cheque_date)
        : null,
      cheque_number,
      amount: Number(amount),
      voucher_type: "Receipt",
      ledger_id: new ObjectId(ledger_id),
      created_at: new Date()
    });

    res.status(201).json({ status: "success" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Cheque number already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getCheques = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("billing");

    const records = await db.collection("cheque_responses")
      .aggregate([
        {
          $lookup: {
            from: "ledgers",
            localField: "ledger_id",
            foreignField: "_id",
            as: "ledger"
          }
        },
        { $unwind: "$ledger" },
        { $sort: { created_at: 1 } }
      ])
      .toArray();

    if (req.query.download === "true") {
      const header =
        '"Reference Date","Cheque Number","Amount (Rs.)","Voucher Type","GSTIN/UIN","Name of Ledger"\n';

      const rows = records.map(r =>
        [
          r.reference_cheque_date?.toISOString().split("T")[0] || "",
          r.cheque_number,
          r.amount,
          r.voucher_type,
          r.ledger.gstin || "",
          r.ledger.name
        ].map(v => `"${v}"`).join(",")
      ).join("\n");

      const csv = header + rows + "\n";

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=response.csv");
      return res.status(200).send(csv);
    }

    res.status(200).json(records);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};