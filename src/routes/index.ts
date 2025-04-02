import { Elysia } from 'elysia';
import { customerService, paymentService, productService, salesService } from '../config/deps';
import { env } from '../config/env';

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

routes.get('/contas_receber/resumo', () => {
    return paymentService.summary();
});

routes.get('/contas_receber/ai', ({ query }) => {
    return paymentService.summaryAI(query);
});

routes.get('/vendas', ({ query }) => {
    return salesService.getSales(query);
});

routes.get('/produtos/mais-vendidos', ({ query }) => {
    return salesService.getTopProductsByQuantity(query);
});

routes.get('/produtos/maior-valor', ({ query }) => {
    return salesService.getTopProductsByValue(query);
});

routes.get('/produtos/variacao-preco', ({ query }) => {
    return salesService.getPriceVariationByProduct(query);
});

routes.get('/empresas/participacao', ({ query }) => {
    return salesService.getCompanySalesParticipation(query);
});

routes.get('/empresas/participacao-por-valor', ({ query }) => {
    return salesService.getCompanySalesParticipationByValue(query);
});

export default routes;
