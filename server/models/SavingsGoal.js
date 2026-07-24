const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    enum: ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Vehicle', 'Retirement', 'Investment', 'Debt Payment', 'Other'],
    default: 'Other',
  },
  targetDate: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

savingsGoalSchema.virtual('progress').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

savingsGoalSchema.index({ user: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
