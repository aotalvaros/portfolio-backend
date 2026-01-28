import { Request, Response } from 'express';
import { contactSchema } from '../schemas/contact.schema';
import { validate } from '../utils/validate';
import { sendContactEmail } from '../services/resend';

export async function handleContact(req: Request, res: Response): Promise<void> {
  const parsed = validate(contactSchema, req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const result = await sendContactEmail(
    parsed.data?.name ?? '',
    parsed.data?.email ?? '',
    parsed.data?.message ?? ''
  );

  if (!result.success) {
    res.status(500).json({ error: 'No se pudo enviar el mensaje, por favor intenta más tarde' });
    return;
  }

  res.status(200).json({ message: 'Mensaje enviado con éxito 🚀' });
}