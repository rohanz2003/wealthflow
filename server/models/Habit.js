const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  type: {
    type: String,
    enum: ['saving', 'budgeting', 'investing', 'tracking', 'learning'],
    default: 'saving',
  },
  streak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  totalCompletions: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  history: [
    {
      date: { type: Date },
      completed: { type: Boolean, default: false },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

habitSchema.index({ user: 1 });
habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
