import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTHORIZATION: z.string(),
    PORT: z.coerce.number().default(8080),
})

export const env = envSchema.parse(process.env);