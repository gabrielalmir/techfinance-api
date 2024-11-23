import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTHORIZATION: z.string(),
    GEMINI_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string(),
    PORT: z.coerce.number().default(3000),
})

export const env = envSchema.parse(process.env);
