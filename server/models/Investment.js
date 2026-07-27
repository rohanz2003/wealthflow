const mongoose = require('mongoose');
const { INVESTMENT_TYPES } = require('../../shared/constants');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Investment name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: INVESTMENT_TYPES,
    default: 'Stocks',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  returnRate: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

investmentSchema.index({ user: 1 });
investmentSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Investment', investmentSchema);