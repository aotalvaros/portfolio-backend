import { Resend } from 'resend';
import 'dotenv/config'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(name: string, email: string, message: string) {
   try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['portafolioandr3so7alvaro@gmail.com'],
      subject: 'Nuevo mensaje desde el portafolio ✉️',
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br/>${message}</p>
      `,
    });

    if (error) {
      console.error('❌ Error al enviar correo:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('❗ Excepción inesperada:', err);
    return { success: false, error: err };
  }
}