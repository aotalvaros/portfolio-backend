import { Schema, model, Document } from 'mongoose';

export interface IModule extends Document {
  moduleName: string;
  isActive: boolean;
}

const moduleSchema = new Schema<IModule>({
  moduleName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
});

export const ModuleModel = model<IModule>('Module', moduleSchema);
