import express from 'express';
import cors from 'cors';
import { contactRouter } from './routes/contact.route';
import { createServer } from 'http';
import { initSocket } from './sockets';
import { moduleRouter } from './routes/module.route';
import { connectDB } from './config/db';
import { authRouter } from './routes/auth.route';
import { timingMiddleware } from './middleware/timing';
import { KeepAliveService } from './services/keep-alive.service';

connectDB(); 

const app = express();
const PORT = process.env.PORT ?? 4000;

const server = createServer(app); 

initSocket(server); 

app.use(cors());
app.use(express.json());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-frontend-url.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(timingMiddleware);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint optimizado
app.get('/health', (req, res) => {
  const keepAliveService = KeepAliveService.getInstance();

  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    jobs: keepAliveService.getJobsStatus()
  });
});

// Endpoint específico para external keep-alive services
app.get('/ping', async (req, res) => {
  try {
    // Realizar ping ligero a MongoDB cuando se recibe ping externo
    const { MongoDBKeepAliveService } = await import('./services/mongodb-keepalive.service');
    const dbStatus = await MongoDBKeepAliveService.pingDatabase();
    
    res.status(200).json({ 
      status: 'pong',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      source: 'external-ping'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

// Usa el router
app.use('/contact', contactRouter); // ✅ esto es importante
app.use('/modules', moduleRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('🚀 API del portafolio corriendo correctamente.');
});

server.listen(PORT, () => {
  console.log(`Servidor con sockets escuchando en el puerto ${PORT}`);

  // Iniciar servicios de keep-alive
  const keepAliveService = KeepAliveService.getInstance();
  keepAliveService.startMongoDBKeepAlive();
  keepAliveService.startHealthCheck();
  
  console.log('Keep-alive services started');
});