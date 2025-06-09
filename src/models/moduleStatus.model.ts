import { Schema, model, Document } from 'mongoose';

export interface IModuleStatus extends Document {
  moduleName: string;
  isActive: boolean;
  name: string;
}

const ModuleStatusSchema = new Schema<IModuleStatus>({
  moduleName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true }
});

export const ModuleStatus = model<IModuleStatus>('ModuleStatus', ModuleStatusSchema);

/*
Define un modelo MongoDB llamado ModuleStatus.

Cada documento representa un módulo (como "contact", "mars-rover", etc.).

Guarda si el módulo está activo o en mantenimiento (isActive).
*/