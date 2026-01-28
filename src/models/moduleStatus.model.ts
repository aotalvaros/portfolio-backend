import { Schema, model, Document, Types } from 'mongoose';

export interface IModuleStatus extends Document {
  moduleName: string;
  isActive: boolean;
  name: string;
  isBlocked: boolean;
  category: 'api' | 'feature' | 'component';
  lastModifiedAt: Date;
  lastModifiedBy: Types.ObjectId;
}

const ModuleStatusSchema = new Schema<IModuleStatus>({
  moduleName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  category: { type: String, enum: ['api', 'feature', 'component'], required: true, default: 'feature' },
  lastModifiedAt: { type: Date, default: Date.now },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export const ModuleStatus = model<IModuleStatus>('ModuleStatus', ModuleStatusSchema);

/*
Define un modelo MongoDB llamado ModuleStatus.

Cada documento representa un módulo (como "contact", "mars-rover", etc.).

Guarda si el módulo está activo o en mantenimiento (isActive).
*/