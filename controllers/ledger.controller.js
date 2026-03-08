import clientPromise from "../lib/mongo.js";

export const createLedger = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("billing");
    const { name, gstin, under, state, gst_registration_type } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Ledger name is required" });
    }

    const result = await db.collection("ledgers").insertOne({
      name,
      gstin: gstin || "",
      under: under || "",
      state: state || "",
      gst_registration_type: gst_registration_type || "",
      created_at: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLedgers = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("billing");
    const ledgers = await db.collection("ledgers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    res.status(200).json(ledgers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};