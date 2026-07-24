const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Debt name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Credit Card', 'Student Loan', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Medical', 'Other'],
    default: 'Other',
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [1, 'Amount must be at least 1'],
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  minimumPayment: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

debtSchema.index({ user: 1 });

module.exports = mongoose.model('Debt', debtSchema);
