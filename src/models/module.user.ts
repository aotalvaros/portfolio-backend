import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  idUsuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superAdmin', 'user'], default: 'user' },
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  permissions: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  mustChangePassword: { type: Boolean, default: true },
  passwordChangedAt: { type: Date, default: null },
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  blockedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);