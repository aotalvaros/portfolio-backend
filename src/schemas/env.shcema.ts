import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default("3000"),
    JWT_SECRET: z.string().min(32),
    DB_URI: z.string().url(),
    REDIS_URL: z.string().url().optional()
});

export const env = envSchema.parse(process.env);