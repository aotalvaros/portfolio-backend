import { ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error.flatten();
    return { success: false, error };
  }
  return { success: true, data: result.data };
}