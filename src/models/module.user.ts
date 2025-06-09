import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['superAdmin'], default: 'superAdmin' },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  permissions: { type: [], default: [] },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String }
},  { timestamps: true });

export const User = mongoose.model('User', userSchema);