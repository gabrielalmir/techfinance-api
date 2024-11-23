import { Elysia } from 'elysia';
import { env } from '../config/env';
import { PaymentRepository } from '../repositories/payment.repository';
import { SalesRepository } from '../repositories/sales.repository';
import { CustomerService } from '../services/customer.service';
import { PaymentService } from '../services/payment.service';
import { ProductService } from '../services/product.service';
import { OpenAIService } from '../services/prompt/openai.service';
import { SaleService } from '../services/sales.service';

const routes = new Elysia();

const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository, new OpenAIService());
const salesRepository = new SalesRepository();
const salesService = new SaleService(salesRepository);
const productService = new ProductService();
const customerService = new CustomerService();

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
