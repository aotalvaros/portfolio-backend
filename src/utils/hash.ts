// src/utils/hash.ts
import bcrypt from 'bcrypt';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (input: string, hashed: string) => bcrypt.compare(input, hashed);

/*La función hashPassword toma una contraseña en texto plano como argumento y utiliza bcrypt.hash para generar un hash seguro. El segundo parámetro, el número 10, indica el "salt rounds", es decir, 
la cantidad de veces que el algoritmo aplicará el proceso de hash, lo que incrementa la seguridad al hacer más costoso computacionalmente descifrar la contraseña. */