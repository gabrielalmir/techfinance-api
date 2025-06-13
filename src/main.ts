import { bearer } from '@elysiajs/bearer';
import cors from '@elysiajs/cors';
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { env } from './config/env';
import { swaggerConfig } from './docs/swagger';
import routes from "./routes";

const app = new Elysia()
    .use(swagger(swaggerConfig))
    .use(cors())
    .use(bearer())
    .onError(({ code, error, set }) => {
        if (code === 'VALIDATION') {
            set.status = 400;
            return { error: 'Invalid request', details: error.message };
        }
        set.status = 500;
        return { error: 'Internal server error' };
    })
    .use(routes);

console.log(`Server running on port ${env.PORT}`);

Bun.serve({
    fetch: app.fetch,
    port: env.PORT,
    idleTimeout: 255,
})
