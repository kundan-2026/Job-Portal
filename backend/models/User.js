import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['candidate','recruiter'], default: 'candidate' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
