import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  location: String,
  fee: Number,
  datePosted: { type: Date, default: Date.now },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Job', jobSchema);
