// src/env.d.ts o env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    RESEND_API_KEY: string;
    // aquí puedes agregar más si luego usas MAIL_TO, etc.
  }
}