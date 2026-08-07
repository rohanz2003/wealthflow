const mongoose = require('mongoose');
const { CURRENCIES } = require('../../shared/constants');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Monthly limit is required'],
    min: [1, 'Limit must be at least 1'],
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: CURRENCIES,
    default: 'INR',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.index({ user: 1, month: 1, year: 1 });
budgetSchema.index({ user: 1, category: 1 }, { unique: false });

module.exports = mongoose.model('Budget', budgetSchema);
