import { Elysia } from 'elysia';
import { env } from '../config/env';
import { salesRoutes } from './billing.route';
import { customerRoutes } from './customer.route';
import { mcpRoutes } from './mcp.route';
import { paymentRoutes } from './payment.route';
import { productsRoutes } from './product.route';

const routes = new Elysia();

routes.guard({
    beforeHandle({ headers }) {
        const { authorization = '' } = headers;
        if (authorization !== `Bearer ${env.AUTHORIZATION}`) {
            return { status: 401, message: 'Unauthorized' };
        }
    },
});

productsRoutes(routes);
customerRoutes(routes);
paymentRoutes(routes);
salesRoutes(routes);
mcpRoutes(routes);

export default routes;
