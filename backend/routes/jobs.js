import express from 'express';
import Job from '../models/Job.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Only recruiters can post jobs' });
    const payload = { ...req.body, recruiter: req.user.id };
    const job = new Job(payload);
    await job.save();
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { q, location, minFee, maxFee, fromDate, toDate } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { company: new RegExp(q, 'i') }];
    if (location) filter.location = new RegExp(location, 'i');
    if (minFee || maxFee) filter.fee = {};
    if (minFee) filter.fee.$gte = Number(minFee);
    if (maxFee) filter.fee.$lte = Number(maxFee);
    if (fromDate || toDate) filter.datePosted = {};
    if (fromDate) filter.datePosted.$gte = new Date(fromDate);
    if (toDate) filter.datePosted.$lte = new Date(toDate);

    const jobs = await Job.find(filter).sort({ datePosted: -1 }).limit(500).populate('recruiter', 'name email');
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
