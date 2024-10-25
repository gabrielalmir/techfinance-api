import { Elysia } from 'elysia';
import { env } from '../config/env';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';

const routes = new Elysia();

routes.guard({
    beforeHandle({ headers }) {
        const { authorization = '' } = headers;
        if (authorization !== `Bearer ${env.AUTHORIZATION}`) {
            return { status: 401, message: 'Unauthorized' };
        }
    },
});

routes.get('/produtos', ({ query }) => {
    return productService.getProducts(query);
});

routes.get('/clientes', ({ query }) => {
    return customerService.getCustomers(query);
});

export default routes;
