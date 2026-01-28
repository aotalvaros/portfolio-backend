/**
 * Migration Script: Add category field to ModuleStatus
 * Created: 2025-01-16
 * Purpose: Add category field to existing module documents
 */

import mongoose from 'mongoose';
import { ModuleStatus } from '../models/moduleStatus.model';
import dotenv from 'dotenv';

dotenv.config();

// Mapeo de módulos a categorías
const moduleCategories: Record<string, 'api' | 'feature' | 'component'> = {
  'nasaGallery': 'api',
  'globalControl': 'feature',
  'contactForm': 'component',
  // Agregar más módulos según sea necesario
};

async function addCategoryToModules() {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.DB_URI;
    if (!dbUri) {
      console.error('MONGODB_URI or DB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(dbUri);
    console.log('Connected to database');

    const modules = await ModuleStatus.find({ category: { $exists: false } });
    console.log(`Found ${modules.length} modules without category`);

    for (const module of modules) {
      const category = moduleCategories[module.moduleName] || 'component';
      await ModuleStatus.updateOne(
        { _id: module._id },
        { $set: { category } }
      );
      console.log(`Updated ${module.moduleName} → category: ${category}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

if (require.main === module) {
  addCategoryToModules();
}

export { addCategoryToModules };
