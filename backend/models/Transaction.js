const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define Transaction schema
const transactionSchema = new Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

// Create the model
const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
