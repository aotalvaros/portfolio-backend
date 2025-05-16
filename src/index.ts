import express from 'express';
import cors from 'cors';
import { contactRouter } from './routes/contact.route';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Usa el router
app.use('/contact', contactRouter); // ✅ esto es importante

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});