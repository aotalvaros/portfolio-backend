import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
 try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      // Pool de conexiones optimizado
      maxPoolSize: 10, // Máximo 10 conexiones concurrentes
      minPoolSize: 2,  // Mínimo 2 conexiones siempre activas
      
      // Timeouts optimizados
      serverSelectionTimeoutMS: 5000, // 5 segundos para seleccionar servidor
      socketTimeoutMS: 45000, // 45 segundos timeout socket
      connectTimeoutMS: 10000, // 10 segundos timeout conexión
      
      // Optimizations
      maxIdleTimeMS: 30000, // Cerrar conexiones idle después de 30s
      bufferCommands: false, // Deshabilitar buffering de comandos
      
      // Compresión para reducir tráfico de red
      compressors: ['zlib'],
    });
    
    // Event listeners para monitoreo
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB Disconnected');
    });
    
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('💥 MongoDB connection failed:', error);
    process.exit(1);
  }
};
