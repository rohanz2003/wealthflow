const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  category: {
    type: String,
    enum: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Other'],
    default: 'Salary',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Income', incomeSchema);
