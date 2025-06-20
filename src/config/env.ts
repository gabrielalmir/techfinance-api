import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTHORIZATION: z.string(),
    OPENAI_API_KEY: z.string(),
    PORT: z.coerce.number().default(3000),
})

export const env = envSchema.parse(Bun.env);
