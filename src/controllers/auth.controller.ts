// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/hash';
import { User } from '../models/module.user';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const match = await comparePassword(password, user.password ?? '');
  if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return res.json({ token });
};

/*Esta función login es un controlador para el endpoint de inicio de sesión en una API construida con Express y TypeScript.
 Su objetivo es autenticar a un usuario y, si las credenciales son correctas, generar y devolver un token JWT.

Primero, la función extrae el email y la password del cuerpo de la solicitud (req.body). 
Luego, busca en la base de datos un usuario cuyo correo electrónico coincida con el proporcionado. 
Si no encuentra ningún usuario, responde con un error 401 y un mensaje de "Credenciales inválidas". 

Si el usuario existe, la función compara la contraseña proporcionada con la almacenada en la base de datos usando la función comparePassword,
    que normalmente utiliza bcrypt para comparar el hash de la contraseña. Si la contraseña no coincide, también responde con un error 401.

Si las credenciales son válidas, la función genera un token JWT usando la función sign de la librería jsonwebtoken. 
    El token incluye el ID y el rol del usuario, y se firma con una clave secreta almacenada en la variable de entorno JWT_SECRET. 
    El token tiene una validez de 1 hora. Finalmente, la función responde con el token generado en formato JSON.

*/