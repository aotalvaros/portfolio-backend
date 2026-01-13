/**
 * Migration Script: Add audit fields to ModuleStatus
 * Created: 2025-01-16
 * Purpose: Add lastModifiedAt and lastModifiedBy fields to existing documents
 * Status: ✅ Executed successfully on 2025-01-16 (updated 7 documents)
 */

import mongoose from 'mongoose';
import { ModuleStatus } from '../models/moduleStatus.model';
import { User } from '../models/module.user';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function migrateModuleStatus() {
  try {
    // Conectar a la base de datos usando la URI del .env
    const dbUri = process.env.MONGODB_URI || process.env.DB_URI;
    if (!dbUri) {
      console.error('MONGODB_URI or DB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(dbUri);
    console.log('Connected to database');

    // Buscar un usuario admin para asignar como lastModifiedBy por defecto
    const adminUser = await User.findOne({ role: 'superAdmin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Actualizar todos los documentos que no tienen los nuevos campos
    const result = await ModuleStatus.updateMany(
      { 
        $or: [
          { lastModifiedAt: { $exists: false } },
          { lastModifiedBy: { $exists: false } }
        ]
      },
      {
        $set: {
          lastModifiedAt: new Date(),
          lastModifiedBy: adminUser._id
        }
      }
    );

    console.log(`Migration completed. Updated ${result.modifiedCount} documents.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateModuleStatus();
}

export { migrateModuleStatus };