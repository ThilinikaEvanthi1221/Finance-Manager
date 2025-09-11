const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Add expense or income
router.post('/', async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all expenses
router.get('/', async (req, res) => {
    const expenses = await Expense.find();
    res.json(expenses);
});

module.exports = router;
