import express from 'express';
import Tracker from '../models/Tracker.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const entry = new Tracker({ ...req.body, user: req.user.id });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await Tracker.find({ user: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
