import { SQL } from 'bun';
import { env } from '../config/env';

export const db = new SQL({ url: env.DATABASE_URL });

