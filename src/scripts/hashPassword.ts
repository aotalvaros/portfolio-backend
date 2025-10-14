// scripts/hashPassword.ts
import bcrypt from 'bcrypt';

const password = 'Ramm**';
bcrypt.hash(password, 10).then((hashed) => {
  console.log('Contraseña hasheada:', hashed);
});
