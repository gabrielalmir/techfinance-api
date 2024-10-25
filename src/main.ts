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
    .use(routes);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
