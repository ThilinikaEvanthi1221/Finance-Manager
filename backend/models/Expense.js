const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    amount: Number,
    category: String,
    note: String,
    type: { type: String, enum: ['income', 'expense'], required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
