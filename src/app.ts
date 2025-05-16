import express from 'express';
import cors from 'cors';
import { contactRouter } from './routes/contact.route';

export const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/contact', contactRouter);
