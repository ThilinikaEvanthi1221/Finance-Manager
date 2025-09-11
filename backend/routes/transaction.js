const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    console.error("Transaction GET Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  try {
    const newTxn = new Transaction(req.body);
    const savedTxn = await newTxn.save();
    res.json(savedTxn);
  } catch (err) {
    console.error("Transaction POST Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
