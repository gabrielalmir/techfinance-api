import { Elysia } from 'elysia';
import { env } from '../config/env';
import { CustomerService } from '../services/customer.service';
import { PaymentService } from '../services/payment.service';
import { ProductService } from '../services/product.service';
import { SaleService } from '../services/sales.service';

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
    const productService = new ProductService();
    return productService.getProducts(query);
});

routes.get('/clientes', ({ query }) => {
    const customerService = new CustomerService();
    return customerService.getCustomers(query);
});

routes.get('/contas_receber/resumo', () => {
    const paymentService = new PaymentService();
    return paymentService.summary();
});

routes.get('/contas_receber/ai', ({ query }) => {
    const paymentService = new PaymentService();
    return paymentService.summaryAI(query);
});

routes.get('/vendas', ({ query }) => {
    const salesService = new SaleService();
    return salesService.getSales(query);
});

routes.get('/produtos/mais-vendidos', ({ query }) => {
    const salesService = new SaleService();
    return salesService.getTopProductsByQuantity(query);
});

routes.get('/produtos/maior-valor', ({ query }) => {
    const salesService = new SaleService();
    return salesService.getTopProductsByValue(query);
});

routes.get('/produtos/variacao-preco', ({ query }) => {
    const salesService = new SaleService();
    return salesService.getPriceVariationByProduct(query);
});

routes.get('/empresas/participacao', ({ query }) => {
    const salesService = new SaleService();
    return salesService.getCompanySalesParticipation(query);
});


export default routes;
