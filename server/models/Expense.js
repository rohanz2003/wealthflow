const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Groceries', 'Dining', 'Other'],
    default: 'Other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
