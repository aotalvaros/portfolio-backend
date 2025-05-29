import express from 'express';
import cors from 'cors';
import { contactRouter } from './routes/contact.route';
import { createServer } from 'http';
import { initSocket } from './sockets';
import { moduleRouter } from './routes/module.route';
import { connectDB } from './config/db';

connectDB(); 

const app = express();
const PORT = process.env.PORT ?? 4000;

const server = createServer(app); 

initSocket(server); 

app.use(cors());
app.use(express.json());

// Usa el router
app.use('/contact', contactRouter); // ✅ esto es importante
app.use('/modules', moduleRouter);

app.get('/', (req, res) => {
  res.send('🚀 API del portafolio corriendo correctamente.');
});

server.listen(PORT, () => {
  console.log(`Servidor con sockets escuchando en el puerto ${PORT}`);
});