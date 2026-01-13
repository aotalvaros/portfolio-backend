import { Schema, model, Document } from 'mongoose';

export interface IModule extends Document {
  moduleName: string;
  isActive: boolean;
  isBlocked: boolean;
}

const moduleSchema = new Schema<IModule>({
  moduleName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false }
});

export const ModuleModel = model<IModule>('Module', moduleSchema);
