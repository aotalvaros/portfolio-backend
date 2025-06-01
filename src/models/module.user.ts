import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['superadmin'], default: 'superadmin' },
  isVerified: { type: Boolean, default: false }
},  { timestamps: true });

export const User = mongoose.model('User', userSchema);