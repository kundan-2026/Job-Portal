import mongoose from 'mongoose';

const trackerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['job','interview','test'], required: true },
  title: String,
  organisation: String,
  date: Date,
  status: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tracker', trackerSchema);
