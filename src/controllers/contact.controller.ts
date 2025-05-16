import { Request, Response } from 'express';
import { contactSchema } from '../schemas/contact.schema';
import { validate } from '../utils/validate';
import { sendContactEmail } from '../services/resend';

export async function handleContact(req: Request, res: Response) {
  const parsed = validate(contactSchema, req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  const result = await sendContactEmail(
    parsed.data?.name ?? '',
    parsed.data?.email ?? '',
    parsed.data?.message ?? ''
  );

  if (!result.success) {
    return res.status(500).json({ error: 'No se pudo enviar el mensaje, por favor intenta más tarde' });
  }

  return res.status(200).json({ message: 'Mensaje enviado con éxito 🚀' });
}