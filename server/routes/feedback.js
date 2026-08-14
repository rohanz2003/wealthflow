const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 100 }).withMessage('Subject cannot exceed 100 characters'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const feedback = await Feedback.create({
        user: req.user.id,
        subject: req.body.subject.trim(),
        message: req.body.message.trim(),
      });
      res.status(201).json(feedback);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/my', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(feedback);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, admin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status === 'open' || req.query.status === 'resolved') {
      filter.status = req.query.status;
    }
    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(feedback);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', auth, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    feedback.status = 'resolved';
    feedback.resolutionNote = (req.body.resolutionNote || '').trim().slice(0, 1000);
    feedback.resolvedAt = new Date();
    feedback.resolvedBy = req.user.id;
    await feedback.save();
    res.json(feedback);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;